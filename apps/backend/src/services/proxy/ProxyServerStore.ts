import { ErrorCode } from "../../helpers/error";
import { AppError } from "../../helpers/error";
import { getLogger } from "../../helpers/logger";
import { db } from "../db";
import { type ProxyServerInstance, proxyMCPServers } from "./proxyMCPServers";

const logger = getLogger("ProxyServerStore");

/**
 * A store that manages proxy server instances.
 * This class is responsible for initializing, maintaining, and cleaning up proxy server instances
 * based on configuration from a JSON file.
 */
export class ProxyServerStore {
  private proxyServers: Map<string, ProxyServerInstance> = new Map();

  /**
   * Private constructor to enforce initialization via the create() factory method.
   */
  private constructor() {}

  /**
   * Creates and initializes a new ProxyServerStore instance.
   * This factory method ensures proper async initialization of the store.
   *
   * @returns A Promise that resolves to an initialized ProxyServerStore instance
   * @throws {AppError} If initialization fails due to configuration issues
   */
  public static async create(): Promise<ProxyServerStore> {
    logger.info("Creating and initializing ProxyServerStore...");
    const store = new ProxyServerStore();
    await store.initialize();
    logger.info("ProxyServerStore initialization complete.");
    return store;
  }

  /**
   * Initializes the store by loading proxy configurations and creating server instances.
   * This method reads the configuration file and sets up proxy server instances for each
   * configured proxy.
   *
   * @throws {AppError} If configuration loading fails or if proxy initialization fails
   */
  private async initialize(): Promise<void> {
    logger.info("Fetching proxy configurations...");
    let proxies = await db.listProxies();

    for (const proxyConfig of proxies) {
      const proxyName = proxyConfig.name;
      logger.info({ message: `Initializing proxy`, proxyName });
      this.proxyServers.set(
        proxyName,
        await proxyMCPServers(proxyConfig.servers),
      );
    }
  }

  /**
   * Retrieves a proxy server instance by name.
   *
   * @param proxyName - The name of the proxy server to retrieve
   * @returns The ProxyServerInstance for the specified proxy
   * @throws {AppError} If the proxy server is not found or failed to initialize
   */
  public get(proxyName: string): ProxyServerInstance {
    const server = this.proxyServers.get(proxyName);
    if (!server) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Proxy server '${proxyName}' not found or failed to initialize.`,
      );
    }
    return server;
  }

  /**
   * Closes and cleans up a specific proxy server instance.
   * This method handles both the proxy instance cleanup and server closure,
   * with appropriate error handling and logging.
   *
   * @param proxyName - The name of the proxy server to close
   * @returns A Promise that resolves when the cleanup is complete
   */
  async close(proxyName: string): Promise<void> {
    const proxyInstance = this.proxyServers.get(proxyName);
    if (proxyInstance) {
      logger.info(`Cleaning up proxy server: ${proxyName}`);
      // Ensure cleanup logic is robust
      try {
        await proxyInstance.close();
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

  /**
   * Closes and cleans up all proxy server instances.
   * This method iterates through all managed proxy servers and closes them in parallel.
   *
   * @returns A Promise that resolves when all cleanup operations are complete
   */
  async closeAll(): Promise<void> {
    logger.info("Cleaning up all proxy servers...");
    const cleanupPromises = Array.from(this.proxyServers.keys()).map(
      (proxyName) => this.close(proxyName),
    );
    await Promise.all(cleanupPromises);
    logger.info("Finished cleaning up all proxy servers.");
  }

  /**
   * Retrieves a list of all managed proxy server names.
   *
   * @returns An array of strings containing the names of all managed proxy servers
   */
  getProxyNames(): string[] {
    return Array.from(this.proxyServers.keys());
  }
}
