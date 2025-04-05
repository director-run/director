import { AppError } from "../../helpers/error";
import { ErrorCode } from "../../helpers/error";
import { getLogger } from "../../helpers/logger";
import { db } from "../db";
import type { McpServer } from "../db/schema";
import { ProxyServer } from "./ProxyServer";

const logger = getLogger("ProxyServerStore");

export class ProxyServerStore {
  private proxyServers: Map<string, ProxyServer> = new Map();

  private constructor() {}

  public static async create(): Promise<ProxyServerStore> {
    logger.info("Creating and initializing ProxyServerStore...");
    const store = new ProxyServerStore();
    await store.initialize();
    logger.info("ProxyServerStore initialization complete.");
    return store;
  }

  private async initialize(): Promise<void> {
    logger.info("Fetching proxy configurations...");
    let proxies = await db.getAll();

    for (const proxyConfig of proxies) {
      const proxyId = proxyConfig.id;
      logger.info({ message: `Initializing proxy`, proxyId });
      this.proxyServers.set(
        proxyId,
        await ProxyServer.create({
          id: proxyId,
          name: proxyConfig.name,
          description: proxyConfig.description ?? undefined,
          targets: proxyConfig.servers,
        }),
      );
    }
  }

  public get(proxyId: string): ProxyServer {
    const server = this.proxyServers.get(proxyId);
    if (!server) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Proxy server '${proxyId}' not found or failed to initialize.`,
      );
    }
    return server;
  }

  async delete(proxyId: string): Promise<void> {
    const proxy = this.get(proxyId);
    await proxy.close();
    await db.deleteProxy(proxyId);
    this.proxyServers.delete(proxyId);
    logger.info(`successfully deleted proxy server configuration: ${proxyId}`);
  }

  async purge(): Promise<void> {
    await this.closeAll();
    await db.purge();
    this.proxyServers.clear();
  }

  async closeAll(): Promise<void> {
    logger.info("cleaning up all proxy servers...");
    await Promise.all(
      Array.from(this.proxyServers.values()).map((proxy) => proxy.close()),
    );
    logger.info("finished cleaning up all proxy servers.");
  }

  public async getAll(): Promise<ProxyServer[]> {
    return Array.from(this.proxyServers.values());
  }

  public async create({
    name,
    description,
    servers,
  }: {
    name: string;
    description?: string;
    servers?: McpServer[];
  }): Promise<ProxyServer> {
    const newProxy = await db.addProxy({
      name,
      description,
      servers: servers ?? [],
      integrations: [],
    });
    const proxyServer = await ProxyServer.create({
      name: name,
      id: newProxy.id,
      targets: newProxy.servers,
    });
    this.proxyServers.set(newProxy.id, proxyServer);
    logger.info({ message: `Created new proxy`, proxyId: newProxy.id });
    return proxyServer;
  }

  public async update(
    proxyId: string,
    attributes: Partial<{
      name: string;
      description: string;
      servers: McpServer[];
    }>,
  ): Promise<ProxyServer> {
    const proxy = this.get(proxyId);
    await proxy.close();
    const updatedProxyEntry = await db.updateProxy(proxyId, attributes);
    const updatedProxy = await ProxyServer.create({
      id: proxyId,
      name: updatedProxyEntry.name,
      description: updatedProxyEntry.description ?? undefined,
      targets: updatedProxyEntry.servers ?? [],
    });
    this.proxyServers.set(proxyId, updatedProxy);
    logger.info({ message: `Updated proxy`, proxyId });
    return updatedProxy;
  }
}
