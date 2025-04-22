import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { env } from "../config";
import { ProxyServerStore } from "../services/proxy/proxy-server-store";
import { startService } from "../start-service";
import { trpc } from "../trpc/client";

export const createMCPServer = (
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
  trpcClient: typeof trpc;
  close: () => Promise<void>;
  proxyStore: ProxyServerStore;
};

export const setupIntegrationTest =
  async (): Promise<IntegrationTestVariables> => {
    const proxyStore = await ProxyServerStore.create();
    const directorService = await startService({ proxyStore });

    const close = async () => {
      await proxyStore.purge();
      await new Promise<void>((resolve) => {
        directorService.close(() => resolve());
      });
    };

    return { trpcClient: trpc, close, proxyStore };
  };

export class TestMCPClient extends Client {
  constructor() {
    super(
      {
        name: "test-client",
        version: "0.0.0",
      },
      {
        capabilities: {
          prompts: {},
          resources: {},
          tools: {},
        },
      },
    );
  }

  static async connectToProxy(proxyId: string): Promise<TestMCPClient> {
    const client = new TestMCPClient();
    await client.connectToURL(
      `http://localhost:${env.SERVER_PORT}/${proxyId}/sse`,
    );
    return client;
  }

  async connectToURL(url: string): Promise<void> {
    const transport = new SSEClientTransport(new URL(url));
    await super.connect(transport);
  }
}

export const hackerNewsProxy = () => ({
  name: "Hackernews",
  transport: {
    type: "stdio" as const,
    command: "uvx",
    args: ["--from", "git+https://github.com/erithwik/mcp-hn", "mcp-hn"],
  },
});

export const fetchProxy = () => ({
  name: "Fetch",
  transport: {
    type: "stdio" as const,
    command: "uvx",
    args: ["mcp-server-fetch"],
  },
});

export const sseProxy = (url: string) => ({
  name: "SSE",
  transport: {
    type: "sse" as const,
    url,
  },
});
