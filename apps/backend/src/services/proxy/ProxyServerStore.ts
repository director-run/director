import { AppError } from "../../helpers/error";
import { ErrorCode } from "../../helpers/error";
import { getLogger } from "../../helpers/logger";
import { db } from "../db";
import { ProxyServer } from "./ProxyServer";

const logger = getLogger("ProxyServerStore");

/**
 * A store that manages proxy server instances.
 * This class is responsible for initializing, maintaining, and cleaning up proxy server instances
 * based on configuration from a JSON file.
 */
export class ProxyServerStore {
  private proxyServers: Map<string, ProxyServer> = new Map();

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

  /**
   * Retrieves a proxy server instance by name.
   *
   * @param proxyId - The id of the proxy server to retrieve
   * @returns The ProxyServerInstance for the specified proxy
   * @throws {AppError} If the proxy server is not found or failed to initialize
   */
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

  /**
   * Deletes a proxy server instance and removes it from the configuration.
   * This method:
   * 1. Closes the proxy server and cleans up its resources
   * 2. Removes it from the in-memory store
   * 3. Removes it from the configuration file on disk
   *
   * @param proxyId - The id of the proxy server to delete
   * @returns A Promise that resolves when the deletion is complete
   * @throws {AppError} If the proxy server is not found
   */
  async delete(proxyId: string): Promise<void> {
    await this.close(proxyId);
    await db.deleteProxy(proxyId);
    logger.info(`Successfully deleted proxy server configuration: ${proxyId}`);
  }

  /**
   * Closes and cleans up a specific proxy server instance.
   * This method handles both the proxy instance cleanup and server closure,
   * with appropriate error handling and logging.
   *
   * @param proxyId - The id of the proxy server to close
   * @returns A Promise that resolves when the cleanup is complete
   */
  async close(proxyId: string): Promise<void> {
    const proxyInstance = this.proxyServers.get(proxyId);
    if (proxyInstance) {
      logger.info(`Cleaning up proxy server: ${proxyId}`);
      // Ensure cleanup logic is robust
      try {
        await proxyInstance.close();
      } catch (cleanupError) {
        logger.error({
          message: `Error during cleanup() for ${proxyId}`,
          error: cleanupError,
        });
      }

      // Check if server and close method exist before calling
      if (
        proxyInstance.getServer() &&
        typeof proxyInstance.getServer().close === "function"
      ) {
        try {
          await proxyInstance.getServer().close();
        } catch (closeError) {
          let errorMessage = `Error closing server for proxy ${proxyId}`;
          if (closeError instanceof Error) {
            errorMessage += `: ${closeError.message}`;
          }
          logger.error({ message: errorMessage, error: closeError });
        }
      } else {
        logger.warn(
          `Server object or close method not found for proxy: ${proxyId} during cleanup.`,
        );
      }
      this.proxyServers.delete(proxyId);
      logger.info(`Successfully cleaned up proxy server: ${proxyId}`);
    } else {
      logger.warn(
        `Attempted to clean up non-existent proxy server: ${proxyId}`,
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
      (proxyId) => this.close(proxyId),
    );
    await Promise.all(cleanupPromises);
    logger.info("Finished cleaning up all proxy servers.");
  }

  /**
   * Retrieves a list of all managed proxy server names.
   *
   * @returns An array of strings containing the names of all managed proxy servers
   */
  getProxyIds(): string[] {
    return Array.from(this.proxyServers.keys());
  }
}
