import { getProxy } from "../../config";
import { PROXY_DB_FILE_PATH } from "../../constants";
import { getLogger } from "../../helpers/logger";
import { type ProxyServerInstance, proxyMCPServers } from "./proxyMCPServers";

// Create a logger specific to this store
const logger = getLogger("ProxyServerStore");

export class ProxyServerStore {
  private proxyServers: Map<string, ProxyServerInstance> = new Map();

  async getOrCreateProxyServer(
    proxyName: string,
  ): Promise<ProxyServerInstance | null> {
    // Return existing proxy server if it exists
    if (this.proxyServers.has(proxyName)) {
      const server = this.proxyServers.get(proxyName);
      if (server) {
        return server;
      }
    }

    try {
      // Create a new proxy server
      logger.info(`Creating new proxy server instance for: ${proxyName}`);
      const proxy = await getProxy(proxyName, PROXY_DB_FILE_PATH);
      const proxyInstance = await proxyMCPServers(proxy.servers);
      this.proxyServers.set(proxyName, proxyInstance);
      logger.info(
        `Successfully created proxy server instance for: ${proxyName}`,
      );
      return proxyInstance;
    } catch (error) {
      // Catch error as unknown implicit type
      // Type guard to safely access error properties
      let errorMessage = `Failed to create proxy server for ${proxyName}`;
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      } else if (typeof error === "string") {
        errorMessage += `: ${error}`;
      }
      logger.error({ message: errorMessage, error });
      return null;
    }
  }

  async cleanupProxyServer(proxyName: string): Promise<void> {
    const proxyInstance = this.proxyServers.get(proxyName);
    if (proxyInstance) {
      logger.info(`Cleaning up proxy server: ${proxyName}`);
      await proxyInstance.cleanup();
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
