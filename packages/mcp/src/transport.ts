import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { HTTPClient } from "./client/http-client";
import { ProxyServer } from "./proxy/proxy-server";

export function serveOverSSE(server: Server, port: number) {
  const app = express();

  let transport: SSEServerTransport;

  app.get("/sse", async (_req, res) => {
    transport = new SSEServerTransport("/message", res);
    await server.connect(transport);
  });

  app.post("/message", async (req, res) => {
    await transport.handlePostMessage(req, res);
  });

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
  //
  // make the router
  //
  const router = express.Router();

  router.use(express.json());
  router.post("/mcp", async (req, res) => {
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
  });

  return router;
}

export function serveOverStreamable(server: Server, port: number) {
  const app = express();

  app.use(express.json());
  app.use(streamableRouter(() => server));

  return app.listen(port);
}
