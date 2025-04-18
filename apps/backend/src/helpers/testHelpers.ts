import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import express from "express";
import superjson from "superjson";
import { PORT } from "../config";
import type { AppRouter } from "../http/routers/trpc";
import { ProxyServerStore } from "../services/proxy/ProxyServerStore";
import { startService } from "../startService";

export const createMCPServer = async (
  port: number,
  callback: (server: McpServer) => void,
) => {
  const server = new McpServer({
    name: "test-sse-proxy-target",
    version: "1.0.0",
  });

  callback(server);

  const app = express();

  let transport: SSEServerTransport;

  app.get("/sse", async (req, res) => {
    transport = new SSEServerTransport("/message", res);
    await server.connect(transport);
  });

  app.post("/message", async (req, res) => {
    await transport.handlePostMessage(req, res);
  });

  const instance = app.listen(port);
  return instance;
};

export type IntegrationTestVariables = {
  trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;
  close: () => Promise<void>;
  proxyStore: ProxyServerStore;
};

export const setupIntegrationTest =
  async (): Promise<IntegrationTestVariables> => {
    const proxyStore = await ProxyServerStore.create();
    const directorService = await startService({ proxyStore });

    const trpcClient = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `http://localhost:${PORT}/trpc`,
          transformer: superjson,
        }),
      ],
    });

    const close = async () => {
      await proxyStore.purge();
      await new Promise<void>((resolve) => {
        directorService.close(() => resolve());
      });
    };

    return { trpcClient, close, proxyStore };
  };
