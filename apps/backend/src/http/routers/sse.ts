import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import type { Router } from "express";
import { getLogger } from "../../helpers/logger";
import { ProxyServerStore } from "../../services/proxy/ProxyServerStore";
import {} from "../../services/proxy/proxyMCPServers";

const logger = getLogger("SSE Router");

export async function sse(): Promise<Router> {
  const router = express.Router();

  const proxyStore = await ProxyServerStore.create();

  // Handle SSE connections for specific proxy
  router.get("/:proxy_name/sse", async (req, res) => {
    const proxyName = req.params.proxy_name;
    const connectionId =
      req.query.connectionId?.toString() || Date.now().toString();

    logger.info({
      message: "Received SSE connection",
      proxyName,
      connectionId,
      query: req.query,
    });

    const proxyInstance = await proxyStore.get(proxyName);
    if (!proxyInstance) {
      res.status(404).send(`Proxy '${proxyName}' not found`);
      return;
    }

    const transport = new SSEServerTransport(`/${proxyName}/message`, res);
    proxyInstance.transports.set(connectionId, transport);

    await proxyInstance.server.connect(transport);

    proxyInstance.server.onerror = (err: Error) => {
      logger.error({
        message: `Server onerror for proxy ${proxyName}`,
        error: err?.stack ?? err.message,
      });
    };

    // Clean up transport when connection closes
    res.on("close", () => {
      logger.info(
        `SSE connection closed for ${proxyName}, connectionId: ${connectionId}`,
      );
      proxyInstance.transports.delete(connectionId);
    });
  });

  // Handle message posts for specific proxy
  router.post("/:proxy_name/message", async (req, res) => {
    const proxyName = req.params.proxy_name;
    const connectionId = req.query.connectionId?.toString();

    logger.info({
      message: "Received message post",
      proxyName,
      connectionId,
      query: req.query,
    });

    const proxyInstance = await proxyStore.get(proxyName);
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
      } else {
        logger.warn(
          `Transport not found for known connectionId ${connectionId} for proxy ${proxyName}.`,
        );
      }
    }

    // Otherwise use the first available transport
    const transports = Array.from(proxyInstance.transports.values());
    if (transports.length > 0) {
      logger.info(
        `Using first available transport for message to proxy ${proxyName} (connectionId: ${connectionId || "none"}).`,
      );
      await transports[0].handlePostMessage(req, res);
    } else {
      logger.warn(
        `No active SSE connections found for proxy ${proxyName} to handle message post.`,
      );
      res.status(400).send("No active connections for this proxy");
    }
  });

  process.on("SIGINT", async () => {
    logger.info("Received SIGINT, cleaning up proxy servers...");
    await proxyStore.closeAll();
    process.exit(0);
  });

  return router;
}
