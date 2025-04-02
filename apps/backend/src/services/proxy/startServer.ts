import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { SSE_PORT } from "../../config";
import { getLogger } from "../../helpers/logger";
import { makeMCPProxyServer } from "../../services/proxy/makeMCPProxyServer";
import { getAllProxies, getProxy } from "../../services/store";

const logger = getLogger("proxyServer");

// Store for active proxy servers
interface ProxyServerInstance {
  server: Server;
  cleanup: () => Promise<void>;
  transports: Map<string, SSEServerTransport>; // Connection ID -> Transport
}

class ProxyServerStore {
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
      const proxy = await getProxy(proxyName);
      const { server, cleanup } = await makeMCPProxyServer(proxy.servers);

      const proxyInstance: ProxyServerInstance = {
        server,
        cleanup,
        transports: new Map(),
      };

      this.proxyServers.set(proxyName, proxyInstance);
      return proxyInstance;
    } catch (error) {
      logger.error({
        message: `Failed to create proxy server for ${proxyName}`,
        error,
      });
      return null;
    }
  }

  async cleanupProxyServer(proxyName: string): Promise<void> {
    const proxyInstance = this.proxyServers.get(proxyName);
    if (proxyInstance) {
      await proxyInstance.cleanup();
      await proxyInstance.server.close();
      this.proxyServers.delete(proxyName);
    }
  }

  async cleanupAllProxyServers(): Promise<void> {
    const cleanupPromises = Array.from(this.proxyServers.entries()).map(
      async ([proxyName]) => this.cleanupProxyServer(proxyName),
    );
    await Promise.all(cleanupPromises);
  }

  getProxyNames(): string[] {
    return Array.from(this.proxyServers.keys());
  }
}

export const startProxyServer = async () => {
  const app = express();
  const proxyStore = new ProxyServerStore();

  // Handle SSE connections for specific proxy
  app.get("/:proxy_name/sse", async (req, res) => {
    const proxyName = req.params.proxy_name;
    const connectionId =
      req.query.connectionId?.toString() || Date.now().toString();

    logger.info({
      message: "Received SSE connection",
      proxyName,
      connectionId,
      query: req.query,
    });

    const proxyInstance = await proxyStore.getOrCreateProxyServer(proxyName);
    if (!proxyInstance) {
      res.status(404).send(`Proxy '${proxyName}' not found`);
      return;
    }

    const transport = new SSEServerTransport(`/${proxyName}/message`, res);
    proxyInstance.transports.set(connectionId, transport);

    await proxyInstance.server.connect(transport);

    proxyInstance.server.onerror = (err) => {
      logger.error({
        message: `Server onerror for proxy ${proxyName}`,
        error: err.stack,
      });
    };

    // Clean up transport when connection closes
    res.on("close", () => {
      proxyInstance.transports.delete(connectionId);
    });
  });

  // Handle message posts for specific proxy
  app.post("/:proxy_name/message", async (req, res) => {
    const proxyName = req.params.proxy_name;
    const connectionId = req.query.connectionId?.toString();

    logger.info({
      message: "Received message",
      proxyName,
      connectionId,
      query: req.query,
    });

    const proxyInstance = await proxyStore.getOrCreateProxyServer(proxyName);
    if (!proxyInstance) {
      res.status(404).send(`Proxy '${proxyName}' not found`);
      return;
    }

    // If connectionId is provided, use that specific transport
    if (connectionId && proxyInstance.transports.has(connectionId)) {
      const transport = proxyInstance.transports.get(connectionId);
      if (transport) {
        await transport.handlePostMessage(req, res);
        return;
      }
    }

    // Otherwise use the first available transport
    const transports = Array.from(proxyInstance.transports.values());
    if (transports.length > 0) {
      await transports[0].handlePostMessage(req, res);
    } else {
      res.status(400).send("No active connections for this proxy");
    }
  });

  // List available proxies
  app.get("/proxies", async (_req, res) => {
    try {
      const proxies = await getAllProxies();
      res.json({
        availableProxies: proxies.map((p) => p.name),
        activeProxies: proxyStore.getProxyNames(),
      });
    } catch (error) {
      logger.error({
        message: "Failed to list proxies",
        error,
      });
      res.status(500).send("Failed to list proxies");
    }
  });

  const expressServer = app.listen(SSE_PORT, () => {
    logger.info(
      `Proxy server started successfully at http://localhost:${SSE_PORT}/:proxy_name/sse`,
    );
  });

  process.on("SIGINT", async () => {
    await proxyStore.cleanupAllProxyServers();
    process.exit(0);
  });

  return expressServer;
};

// For backward compatibility
export const startSSEServer = async (name: string) => {
  const app = express();
  const proxy = await getProxy(name);

  const { server, cleanup } = await makeMCPProxyServer(proxy.servers);

  let transport: SSEServerTransport;

  app.get("/sse", async (req, res) => {
    logger.info({
      message: "Received SSE connection",
      query: req.query,
      params: req.params,
    });
    transport = new SSEServerTransport("/message", res);

    await server.connect(transport);

    server.onerror = (err) => {
      logger.error(`Server onerror: ${err.stack}`);
    };
  });

  app.post("/message", async (req, res) => {
    logger.info({
      message: "Received message",
      query: req.query,
      params: req.params,
    });
    await transport.handlePostMessage(req, res);
  });

  const expressServer = app.listen(SSE_PORT, () => {
    logger.info(
      `server started successfully at http://localhost:${SSE_PORT}/sse`,
    );
    logger.warn(
      `This method is deprecated. Please use the new proxy server with the URL pattern /:proxy_name/sse`,
    );
  });

  process.on("SIGINT", async () => {
    await cleanup();
    await server.close();
    process.exit(0);
  });

  return expressServer;
};
