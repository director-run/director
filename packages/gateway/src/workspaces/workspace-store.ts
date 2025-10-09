import { HTTPClient } from "@director.run/mcp/client/http-client";
import {
  OAuthProviderFactory,
  type OAuthProviderFactoryParams,
} from "@director.run/mcp/oauth/oauth-provider-factory";
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
  private _oauth?: OAuthProviderFactoryParams;

  private constructor(params: {
    config: Config;
    telemetry?: Telemetry;
    oauth?: OAuthProviderFactoryParams;
  }) {
    this.config = params.config;
    this.telemetry = params.telemetry || Telemetry.noTelemetry();
    this._oauth = params.oauth;
  }

  public static async create({
    config,
    telemetry,
    oauth,
  }: {
    config: Config;
    telemetry?: Telemetry;
    oauth?: OAuthProviderFactoryParams;
  }): Promise<WorkspaceStore> {
    logger.debug("initializing WorkspaceStore");
    const store = new WorkspaceStore({
      config,
      telemetry,
      oauth,
    });
    await store.initialize();
    logger.debug("initialization complete");
    return store;
  }

  private async initialize(): Promise<void> {
    let proxies = await this.config.getWorkspaces();

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
    for (const server of proxy.targets) {
      if (server instanceof HTTPClient && (await server.isAuthenticated())) {
        await server.logout();
      }
    }
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

  public async onAuthorizationSuccess(
    factoryId: string,
    providerId: string,
    code: string,
  ) {
    const workspace = await this.get(factoryId);
    const target = await workspace.getTarget(providerId);

    if (target instanceof HTTPClient) {
      await target.completeAuthFlow(code);
    } else {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `target ${providerId} is not an HTTP client`,
      );
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

    const configEntry = await this.config.createWorkspace({
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

  private async initializeAndAddProxy(workspaceParams: WorkspaceParams) {
    const workspace = await Workspace.fromConfig(workspaceParams, {
      oAuthHandler: this._oauth
        ? new OAuthProviderFactory({
            ...this._oauth,
            id: workspaceParams.id,
          })
        : undefined,
      config: this.config,
    });

    this.workspaces.set(workspace.id, workspace);

    return workspace;
  }
}
