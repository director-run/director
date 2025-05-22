import { ProxyServer } from "@director.run/mcp/proxy-server";
import type { ProxyTargetAttributes } from "@director.run/mcp/types";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import type { Database } from "./db";

const logger = getLogger("ProxyServerStore");

export class ProxyServerStore {
  private proxyServers: Map<string, ProxyServer> = new Map();
  private db: Database;

  private constructor(params: { db: Database }) {
    this.db = params.db;
  }

  public static async create(db: Database): Promise<ProxyServerStore> {
    logger.info("Creating and initializing ProxyServerStore...");
    const store = new ProxyServerStore({
      db,
    });
    await store.initialize();
    logger.info("ProxyServerStore initialization complete.");
    return store;
  }

  private async initialize(): Promise<void> {
    logger.info("Fetching proxy configurations...");
    let proxies = await this.db.getAll();

    for (const proxyConfig of proxies) {
      const proxyId = proxyConfig.id;
      logger.info({ message: `Initializing proxy`, proxyId });

      const proxyServer = new ProxyServer({
        id: proxyId,
        name: proxyConfig.name,
        description: proxyConfig.description ?? undefined,
        servers: proxyConfig.servers,
      });
      await proxyServer.connectTargets();
      this.proxyServers.set(proxyId, proxyServer);
    }
  }

  public get(proxyId: string) {
    const server = this.proxyServers.get(proxyId);
    if (!server) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Proxy server '${proxyId}' not found or failed to initialize.`,
      );
    }
    return server;
  }

  async delete(proxyId: string) {
    const proxy = this.get(proxyId);
    await proxy.close();
    await this.db.deleteProxy(proxyId);
    this.proxyServers.delete(proxyId);
    logger.info(`successfully deleted proxy server configuration: ${proxyId}`);
  }

  async purge() {
    await this.closeAll();
    await this.db.purge();
    this.proxyServers.clear();
  }

  async closeAll() {
    logger.info("cleaning up all proxy servers...");
    await Promise.all(
      Array.from(this.proxyServers.values()).map((proxy) => proxy.close()),
    );
    logger.info("finished cleaning up all proxy servers.");
  }

  public getAll(): ProxyServer[] {
    return Array.from(this.proxyServers.values());
  }

  public async create({
    name,
    description,
    servers,
    source,
  }: {
    name: string;
    description?: string;
    servers?: ProxyTargetAttributes[];
    source?: {
      type: "registry";
      entry: {
        id: string;
        name: string;
        title: string;
      };
    };
  }): Promise<ProxyServer> {
    const newProxy = await this.db.addProxy({
      name,
      description,
      servers: servers ?? [],
    });
    const proxyServer = new ProxyServer({
      name: name,
      id: newProxy.id,
      servers: newProxy.servers,
      description: newProxy.description ?? undefined,
    });
    await proxyServer.connectTargets();
    this.proxyServers.set(newProxy.id, proxyServer);
    logger.info({ message: `Created new proxy`, proxyId: newProxy.id });
    return proxyServer;
  }

  public async addServer(
    proxyId: string,
    server: ProxyTargetAttributes,
  ): Promise<ProxyServer> {
    const proxy = this.get(proxyId);
    // TODO:
    //   - Do not recreate the proxy server, just update the server
    //   - After updating, call proxy.sendToolListChanged(); (also add necessary capability to server definition)
    //   - At the moment (22/05/2025), neither Claude nor Cursor seem to support this so leaving it like this for now

    if (
      proxy.attributes.servers.some(
        (s) => s.name.toLocaleLowerCase() === server.name.toLocaleLowerCase(),
      )
    ) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `Server '${server.name}' already exists in proxy '${proxyId}'`,
      );
    }

    const updatedProxy = await this.update(proxyId, {
      servers: [...proxy.attributes.servers, server],
    });
    return updatedProxy;
  }

  public async removeServer(
    proxyId: string,
    serverName: string,
  ): Promise<ProxyServer> {
    const proxy = this.get(proxyId);
    // TODO: don't re-create the proxy server, just update the servers - same as addServer
    if (
      !proxy.attributes.servers.some(
        (s) => s.name.toLowerCase() === serverName.toLowerCase(),
      )
    ) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `Server '${serverName}' not found in proxy '${proxyId}'`,
      );
    }

    const updatedProxy = await this.update(proxyId, {
      servers: proxy.attributes.servers.filter(
        (s) => s.name.toLowerCase() !== serverName.toLowerCase(),
      ),
    });
    return updatedProxy;
  }

  public async update(
    proxyId: string,
    attributes: Partial<{
      name: string;
      description: string;
      servers: ProxyTargetAttributes[];
    }>,
  ) {
    const proxy = this.get(proxyId);
    await proxy.close();
    const updatedProxyEntry = await this.db.updateProxy(proxyId, attributes);
    const updatedProxy = new ProxyServer({
      id: proxyId,
      name: updatedProxyEntry.name,
      description: updatedProxyEntry.description ?? undefined,
      servers: updatedProxyEntry.servers ?? [],
    });
    await updatedProxy.connectTargets();
    this.proxyServers.set(proxyId, updatedProxy);
    logger.info({ message: `Updated proxy`, proxyId });
    return updatedProxy;
  }
}
