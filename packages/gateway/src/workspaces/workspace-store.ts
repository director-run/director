import { HTTPClient } from "@director.run/mcp/client/http-client";
import { OAuthHandler } from "@director.run/mcp/oauth/oauth-provider-factory";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { Telemetry } from "@director.run/utilities/telemetry";
import type { Config } from "../config";
import {
  Workspace,
  type WorkspaceParams,
  type WorkspaceTarget,
} from "./workspace";

const logger = getLogger("WorkspaceStore");

export class WorkspaceStore {
  private workspaces: Map<string, Workspace> = new Map();
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
    config,
    telemetry,
    oAuthHandler,
  }: {
    config: Config;
    telemetry?: Telemetry;
    oAuthHandler?: OAuthHandler;
  }): Promise<WorkspaceStore> {
    logger.debug("initializing WorkspaceStore");
    const store = new WorkspaceStore({
      config,
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
    const server = this.workspaces.get(proxyId);
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
    await this.config.unsetWorkspace(proxyId);
    this.workspaces.delete(proxyId);
    logger.info(`successfully deleted proxy server configuration: ${proxyId}`);
  }

  async purge() {
    await this.closeAll();
    await this.config.purge();
    this.workspaces.clear();
  }

  async closeAll() {
    logger.info("cleaning up all proxy servers...");
    await Promise.all(
      Array.from(this.workspaces.values()).map((proxy) => proxy.close()),
    );
    logger.info("finished cleaning up all proxy servers.");
  }

  public getAll(): Workspace[] {
    return Array.from(this.workspaces.values());
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
    servers?: WorkspaceTarget[];
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

  private async initializeAndAddProxy(proxy: WorkspaceParams) {
    const workspace = await Workspace.fromConfig(proxy, {
      oAuthHandler: this._oAuthHandler,
      config: this.config,
    });

    this.workspaces.set(workspace.id, workspace);

    return workspace;
  }
}
