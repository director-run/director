import type { Config } from "@director/core/config/types";
import { AppError, ErrorCode } from "@director/core/error";
import { getLogger } from "@director/core/logger";
import { createProxyServer } from "@director/core/proxy/createProxyServer";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";

const logger = getLogger("startSSEServer");

export const startSSEServer = async ({
  name,
  config,
}: {
  name: string;
  config: Config;
}) => {
  const app = express();
  const proxyConfig = config.proxies.find((proxy) => proxy.name === name);

  if (!proxyConfig) {
    throw new AppError(
      ErrorCode.NOT_FOUND,
      `Proxy config for ${name} not found`,
    );
  }

  const { server, cleanup } = await createProxyServer(proxyConfig);

  let transport: SSEServerTransport;

  app.get("/sse", async (req, res) => {
    const clientIp =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";
    logger.info("Received connection", { userAgent, clientIp });

    transport = new SSEServerTransport("/message", res);

    // Send an initial ping to ensure connection is established (SSE doesn't work in Bun otherwise)
    res.write("event: ping\ndata: connected\n\n");

    await server.connect(transport);

    server.onerror = (err) => {
      logger.error(`Server onerror: ${err.stack}`);
    };
  });

  app.post("/message", async (req, res) => {
    logger.info("Received message", req.body);
    await transport.handlePostMessage(req, res);
  });

  const expressServer = app.listen(config.ssePort, () => {
    logger.info(
      `server started successfully at http://localhost:${config.ssePort}/sse`,
    );
  });

  process.on("SIGINT", async () => {
    await cleanup();
    await server.close();
    process.exit(0);
  });

  return expressServer;
};
