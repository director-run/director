import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import express from "express";
import { HTTPClient } from "./client/http-client";
import { ProxyServer } from "./proxy/proxy-server";

export function sseRouter(
  getServer: (req: express.Request) => Promise<Server> | Server,
  options?: {
    getMessagePath?: (req: express.Request) => string;
  },
): express.Router {
  const router = express.Router({ mergeParams: true });
  const transports: Map<string, SSEServerTransport> = new Map();

  router.get("/sse", async (req, res, next) => {
    try {
      const server = await getServer(req);
      const messagePath = options?.getMessagePath?.(req) ?? "/message";
      const transport = new SSEServerTransport(messagePath, res);

      transports.set(transport.sessionId, transport);

      req.socket.on("close", () => {
        transports.delete(transport.sessionId);
      });

      await server.connect(transport);
    } catch (error) {
      next(error);
    }
  });

  router.post("/message", async (req, res, next) => {
    try {
      const sessionId = req.query.sessionId?.toString();

      if (!sessionId) {
        res.status(400).json({ error: "No sessionId provided" });
        return;
      }

      const transport = transports.get(sessionId);

      if (!transport) {
        res.status(404).json({ error: "Transport not found" });
        return;
      }

      await transport.handlePostMessage(req, res);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export function serveOverSSE(server: Server, port: number) {
  const app = express();

  app.use(sseRouter(() => server));

  const instance = app.listen(port);
  return instance;
}

export async function serveOverStdio(server: Server) {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.on("SIGINT", async () => {
    await transport.close();
    await server.close();
    process.exit(0);
  });
}

export async function proxyHTTPToStdio(url: string) {
  try {
    const proxy = new ProxyServer({
      id: "http2stdio",
      servers: [
        new HTTPClient({
          name: "director-http",
          url: url,
        }),
      ],
    });

    await proxy.connectTargets({ throwOnError: true });
    await serveOverStdio(proxy);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export function streamableRouter(
  getServer: (req: express.Request) => Promise<Server> | Server,
): express.Router {
  const router = express.Router({ mergeParams: true });

  router.use(express.json());
  router.post("/mcp", async (req, res, next) => {
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });

      res.on("close", () => {
        transport.close();
      });

      const server = await getServer(req);
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export function serveOverStreamable(server: Server, port: number) {
  const app = express();

  app.use(express.json());
  app.use(streamableRouter(() => server));

  return app.listen(port);
}
