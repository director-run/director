import type { Server } from "node:http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { createTRPCClient } from "@trpc/client";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { z } from "zod";
import { PORT } from "../../config";
import {
  createMCPServer,
  setupIntegrationTest,
} from "../../helpers/testHelpers";
import { ProxyServerStore } from "../../services/proxy/ProxyServerStore";
import type { AppRouter } from "./trpc";

describe("SSE Router", () => {
  let proxyTargetServerInstance: Server;
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;
  let close: () => Promise<void>;
  let proxyStore: ProxyServerStore;

  beforeAll(async () => {
    proxyTargetServerInstance = await createMCPServer(4521, (server) => {
      server.tool("echo", { message: z.string() }, async ({ message }) => ({
        content: [{ type: "text", text: `Tool echo: ${message}` }],
      }));
    });

    const attributes = await setupIntegrationTest();
    trpcClient = attributes.trpcClient;
    close = attributes.close;
    proxyStore = attributes.proxyStore;

    await trpcClient.store.create.mutate({
      name: "Test Proxy",
      servers: [
        {
          name: "Hackernews",
          transport: {
            type: "stdio",
            command: "uvx",
            args: [
              "--from",
              "git+https://github.com/erithwik/mcp-hn",
              "mcp-hn",
            ],
          },
        },
        {
          name: "Fetch",
          transport: {
            type: "stdio",
            command: "uvx",
            args: ["mcp-server-fetch"],
          },
        },
        {
          name: "test-sse-transport",
          transport: {
            type: "sse",
            url: "http://localhost:4521/sse",
          },
        },
      ],
    });
  });

  afterAll(async () => {
    await close();
    await proxyTargetServerInstance?.close();
  });

  test("should return 404 when proxy not found", async () => {
    const client = new Client(
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

    const transport = new SSEClientTransport(
      new URL(`http://localhost:${PORT}/not_existing_proxy/sse`),
    );

    await expect(client.connect(transport)).rejects.toMatchObject({
      code: 404,
    });
  });

  test("should connect and list tools", async () => {
    const client = new Client(
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

    const transport = new SSEClientTransport(
      new URL(`http://localhost:${PORT}/test-proxy/sse`),
    );
    await client.connect(transport);

    const toolsResult = await client.listTools();
    const expectedToolNames = [
      "get_stories",
      "get_user_info",
      "search_stories",
      "get_story_info",
      "fetch",
      "echo",
    ];
    for (const toolName of expectedToolNames) {
      const tool = toolsResult.tools.find((t) => t.name === toolName);
      expect(tool).toBeDefined();
      expect(tool?.name).toBe(toolName);
    }
    expect(
      toolsResult.tools.find((t) => t.name === "get_stories")?.description,
    ).toContain("[Hackernews]");
    expect(
      toolsResult.tools.find((t) => t.name === "get_user_info")?.description,
    ).toContain("[Hackernews]");
    expect(
      toolsResult.tools.find((t) => t.name === "search_stories")?.description,
    ).toContain("[Hackernews]");
    expect(
      toolsResult.tools.find((t) => t.name === "get_story_info")?.description,
    ).toContain("[Hackernews]");
    expect(
      toolsResult.tools.find((t) => t.name === "fetch")?.description,
    ).toContain("[Fetch]");

    await client.close();
  });
});
