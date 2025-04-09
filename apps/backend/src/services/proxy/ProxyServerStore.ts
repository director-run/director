// import { getProxies, getProxy } from "../../config";
import type { Config } from "../../config/schema";
import { PROXY_DB_FILE_PATH } from "../../constants";
import { getLogger } from "../../helpers/logger";
import { readJsonFile } from "../../helpers/read-json";
import { type ProxyServerInstance, proxyMCPServers } from "./proxyMCPServers";
// Create a logger specific to this store
const logger = getLogger("ProxyServerStore");

export class ProxyServerStore {
  private proxyServers: Map<string, ProxyServerInstance> = new Map();

  // Private constructor - initialization must use create()
  private constructor() {}

  // Static async factory method for initialization
  public static async create(): Promise<ProxyServerStore> {
    logger.info("Creating and initializing ProxyServerStore...");
    const store = new ProxyServerStore();
    await store.initialize();
    logger.info("ProxyServerStore initialization complete.");
    return store;
  }

  private async initialize(): Promise<void> {
    logger.info("Fetching proxy configurations...");
    const config = await readJsonFile<Config>(PROXY_DB_FILE_PATH);
    let proxies = config.proxies;

    for (const proxyConfig of proxies) {
      const proxyName = proxyConfig.name;
      try {
        logger.info(`Initializing proxy server instance for: ${proxyName}`);
        // Assuming getProxy fetches the detailed config needed by proxyMCPServers
        const proxyInstance = await proxyMCPServers(proxyConfig.servers);
        this.proxyServers.set(proxyName, proxyInstance);
        logger.info(`Successfully initialized proxy server for: ${proxyName}`);
      } catch (error) {
        logger.error({
          message: `Failed to initialize proxy server for ${proxyName}`,
          error: error instanceof Error ? error.message : String(error),
        });
        // Decide if one failure should stop all initialization or just skip
        // Currently skipping the failed one
      }
    }
  }

  // Renamed: Get an already initialized proxy server
  public get(proxyName: string): ProxyServerInstance {
    const server = this.proxyServers.get(proxyName);
    if (!server) {
      // Log warning and throw error if server doesn't exist in the map
      logger.warn(
        `Attempted to get non-existent or failed-to-initialize proxy server: ${proxyName}`,
      );
      throw new Error(
        `Proxy server '${proxyName}' not found or failed to initialize.`,
      );
    }
    return server;
  }

  async cleanupProxyServer(proxyName: string): Promise<void> {
    const proxyInstance = this.proxyServers.get(proxyName);
    if (proxyInstance) {
      logger.info(`Cleaning up proxy server: ${proxyName}`);
      // Ensure cleanup logic is robust
      try {
        await proxyInstance.cleanup();
      } catch (cleanupError) {
        logger.error({
          message: `Error during cleanup() for ${proxyName}`,
          error: cleanupError,
        });
      }

      // Check if server and close method exist before calling
      if (
        proxyInstance.server &&
        typeof proxyInstance.server.close === "function"
      ) {
        try {
          await proxyInstance.server.close();
        } catch (closeError) {
          let errorMessage = `Error closing server for proxy ${proxyName}`;
          if (closeError instanceof Error) {
            errorMessage += `: ${closeError.message}`;
          }
          logger.error({ message: errorMessage, error: closeError });
        }
      } else {
        logger.warn(
          `Server object or close method not found for proxy: ${proxyName} during cleanup.`,
        );
      }
      this.proxyServers.delete(proxyName);
      logger.info(`Successfully cleaned up proxy server: ${proxyName}`);
    } else {
      logger.warn(
        `Attempted to clean up non-existent proxy server: ${proxyName}`,
      );
    }
  }

  async cleanupAllProxyServers(): Promise<void> {
    logger.info("Cleaning up all proxy servers...");
    const cleanupPromises = Array.from(this.proxyServers.keys()).map(
      (proxyName) => this.cleanupProxyServer(proxyName),
    );
    await Promise.all(cleanupPromises);
    logger.info("Finished cleaning up all proxy servers.");
  }

  getProxyNames(): string[] {
    return Array.from(this.proxyServers.keys());
  }
}
