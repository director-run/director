import { AppError } from "../../helpers/error";
import { ErrorCode } from "../../helpers/error";
import { getLogger } from "../../helpers/logger";
import { db } from "../db";
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
    let proxies = await db.listProxies();

    for (const proxyConfig of proxies) {
      const proxyId = proxyConfig.id;
      logger.info({ message: `Initializing proxy`, proxyId });
      this.proxyServers.set(
        proxyId,
        await ProxyServer.create({
          id: proxyId,
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
    logger.info(`successfully deleted proxy server configuration: ${proxyId}`);
  }

  async closeAll(): Promise<void> {
    logger.info("cleaning up all proxy servers...");

    await Promise.all(this.proxyServers.values().map((proxy) => proxy.close()));

    logger.info("finished cleaning up all proxy servers.");
  }
}
