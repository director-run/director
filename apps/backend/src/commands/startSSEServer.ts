import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { SSE_PORT } from "../config";
import { getLogger } from "../helpers/logger";
import { createProxyServer } from "../services/proxy/createProxyServer";
import { getProxy } from "../services/store";

const logger = getLogger("startSSEServer");

export const startSSEServer = async (name: string) => {
  const app = express();
  const proxy = await getProxy(name);

  const { server, cleanup } = await createProxyServer(proxy);

  let transport: SSEServerTransport;

  app.get("/sse", async (req, res) => {
    const clientIp =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";
    logger.info("Received connection-", { userAgent, clientIp });

    transport = new SSEServerTransport("/message", res);
    logger.info("Post connection-");

    // Send an initial ping to ensure connection is established (SSE doesn't work in Bun otherwise)
    // res.write("event: ping\ndata: connected\n\n");

    await server.connect(transport);
    logger.info("Post server.connect-");

    server.onerror = (err) => {
      logger.error(`Server onerror: ${err.stack}`);
    };
  });

  app.post("/message", async (req, res) => {
    logger.info("Received message", req.body);
    await transport.handlePostMessage(req, res);
  });

  const expressServer = app.listen(SSE_PORT, () => {
    logger.info(
      `server started successfully at http://localhost:${SSE_PORT}/sse`,
    );
  });

  process.on("SIGINT", async () => {
    await cleanup();
    await server.close();
    process.exit(0);
  });

  return expressServer;
};
