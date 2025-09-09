import { HTTPClient } from "@director.run/mcp/client/http-client";
import { OAuthHandler } from "@director.run/mcp/oauth/oauth-provider-factory";
import {
  // ProxyServer,
  type ProxyTarget,
} from "@director.run/mcp/proxy/proxy-server";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import type {
  ProxyServerAttributes,
  ProxyTargetAttributes,
} from "@director.run/utilities/schema";
import { Telemetry } from "@director.run/utilities/telemetry";
import { type Prompt } from "../capabilities/prompt-manager";
import type { Config } from "../config";
import { Workspace } from "./workspace";

const logger = getLogger("WorkspaceStore");

export class WorkspaceStore {
  private proxyServers: Map<string, Workspace> = new Map();
  private config: Config;
  private telemetry: Telemetry;
  private _oAuthHandler?: OAuthHandler;

  private constructor(params: {
    config: Config;
    telemetry?: Telemetry;
    oAuthHandler?: OAuthHandler;
  }) {
    this.config = params.config;
    this.telemetry = params.telemetry || Telemetry.noTelemetry();
    this._oAuthHandler = params.oAuthHandler;
  }

  public static async create({
    config: db,
    telemetry,
    oAuthHandler,
  }: {
    config: Config;
    telemetry?: Telemetry;
    oAuthHandler?: OAuthHandler;
  }): Promise<WorkspaceStore> {
    logger.debug("initializing WorkspaceStore");
    const store = new WorkspaceStore({
      config: db,
      telemetry,
      oAuthHandler,
    });
    await store.initialize();
    logger.debug("initialization complete");
    return store;
  }

  private async initialize(): Promise<void> {
    let proxies = await this.config.getAll();

    for (const proxyConfig of proxies) {
      const proxyId = proxyConfig.id;
      logger.debug({ message: `initializing ${proxyId}`, proxyId });

      await this.initializeAndAddProxy({
        id: proxyId,
        name: proxyConfig.name,
        description: proxyConfig.description ?? undefined,
        servers: proxyConfig.servers,
      });
    }
  }

  public get(proxyId: string) {
    const server = this.proxyServers.get(proxyId);
    if (!server) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `proxy server '${proxyId}' not found or failed to initialize.`,
      );
    }
    return server;
  }

  async delete(proxyId: string) {
    this.telemetry.trackEvent("proxy_deleted");

    const proxy = this.get(proxyId);
    await proxy.close();
    await this.config.deleteProxy(proxyId);
    this.proxyServers.delete(proxyId);
    logger.info(`successfully deleted proxy server configuration: ${proxyId}`);
  }

  async purge() {
    await this.closeAll();
    await this.config.purge();
    this.proxyServers.clear();
  }

  async closeAll() {
    logger.info("cleaning up all proxy servers...");
    await Promise.all(
      Array.from(this.proxyServers.values()).map((proxy) => proxy.close()),
    );
    logger.info("finished cleaning up all proxy servers.");
  }

  public getAll(): Workspace[] {
    return Array.from(this.proxyServers.values());
  }

  public async onAuthorizationSuccess(serverUrl: string, code: string) {
    const proxies = this.getAll();
    for (const proxy of proxies) {
      const targets = proxy.targets;
      for (const target of targets) {
        if (target instanceof HTTPClient && target.url === serverUrl) {
          await target.completeAuthFlow(code);
        }
      }
    }
  }

  public async create({
    name,
    description,
    servers,
  }: {
    name: string;
    description?: string;
    servers?: ProxyTargetAttributes[];
  }): Promise<Workspace> {
    this.telemetry.trackEvent("proxy_created");

    const configEntry = await this.config.addProxy({
      name,
      description,
      servers: servers ?? [],
    });

    const proxyServer = await this.initializeAndAddProxy({
      name,
      description,
      servers: servers ?? [],
      id: configEntry.id,
    });
    logger.info({ message: `Created new proxy`, proxyId: configEntry.id });
    return proxyServer;
  }

  private async initializeAndAddProxy(proxy: ProxyServerAttributes) {
    const workspace = await Workspace.fromConfig(proxy, {
      oAuthHandler: this._oAuthHandler,
      config: this.config,
    });

    this.proxyServers.set(workspace.id, workspace);

    return workspace;
  }

  public async addServer(
    proxyId: string,
    server: ProxyTargetAttributes,
    params: { throwOnError: boolean } = { throwOnError: true },
  ): Promise<ProxyTarget> {
    const workspace = this.get(proxyId);
    const target = await workspace.addTarget(server, params);
    return target;
  }

  public async removeServer(
    proxyId: string,
    serverName: string,
  ): Promise<ProxyTarget> {
    const workspace = this.get(proxyId);
    const removedTarget = await workspace.removeTarget(serverName);
    return removedTarget;
  }

  public async update(
    proxyId: string,
    attributes: Partial<Pick<ProxyServerAttributes, "name" | "description">>,
  ) {
    const workspace = this.get(proxyId);
    await workspace.update(attributes);
    return workspace;
  }

  public async updateServer(
    proxyId: string,
    serverName: string,
    attributes: Partial<
      Pick<ProxyTargetAttributes, "toolPrefix" | "disabledTools">
    >,
  ): Promise<ProxyTarget> {
    const workspace = this.get(proxyId);
    const target = await workspace.updateTarget(serverName, attributes);
    return target;
  }

  public async addPrompt(proxyId: string, prompt: Prompt) {
    const workspace = this.get(proxyId);
    return await workspace.addPrompt(prompt);
  }

  public async removePrompt(proxyId: string, promptName: string) {
    const workspace = this.get(proxyId);
    await workspace.removePrompt(promptName);
    return true;
  }

  public async updatePrompt(
    proxyId: string,
    promptName: string,
    prompt: Partial<Pick<Prompt, "title" | "description" | "body">>,
  ) {
    const workspace = this.get(proxyId);
    return await workspace.updatePrompt(promptName, prompt);
  }

  public async listPrompts(proxyId: string): Promise<Prompt[]> {
    const workspace = this.get(proxyId);
    return await workspace.listPrompts();
  }
}
