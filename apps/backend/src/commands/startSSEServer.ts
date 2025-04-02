import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { SSE_PORT } from "../config";
import { getLogger } from "../helpers/logger";
import { createMCPProxy } from "../services/proxy/createMCPProxy";
import { getProxy } from "../services/store";

const logger = getLogger("startSSEServer");

export const startSSEServer = async (name: string) => {
  const app = express();
  const proxy = await getProxy(name);

  const { server, cleanup } = await createMCPProxy(proxy.servers);

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
  });

  process.on("SIGINT", async () => {
    await cleanup();
    await server.close();
    process.exit(0);
  });

  return expressServer;
};
