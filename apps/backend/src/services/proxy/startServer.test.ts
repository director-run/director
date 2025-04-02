import fs from "fs";
import http from "http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { PROXY_DB_FILE_PATH, SSE_PORT } from "../../config";
import { startServer } from "./startServer";

import type { Server } from "node:http";
import { createProxyTargetServer } from "../../commands/__tests__/createProxyTargetServer";

// Test configuration to use for tests
const testConfig = {
  proxies: [
    {
      name: "test-proxy",
      servers: [
        {
          name: "Hackernews",
          transport: {
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
    },
  ],
};

// Path to the test config file
describe("Proxy Server Integration Tests", () => {
  let proxyServer: http.Server | undefined;
  let proxyTargetServerInstance: Server;

  beforeAll(async () => {
    fs.writeFileSync(PROXY_DB_FILE_PATH, JSON.stringify(testConfig, null, 2));
    proxyTargetServerInstance = await createProxyTargetServer(4521);
    proxyServer = await startServer();
  });

  afterAll(async () => {
    fs.unlinkSync(PROXY_DB_FILE_PATH);
    if (proxyServer) {
      await new Promise<void>((resolve) => {
        proxyServer?.close(() => resolve());
      });
      proxyServer = undefined;
    }
    await proxyTargetServerInstance?.close();
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
      new URL(`http://localhost:${SSE_PORT}/test-proxy/sse`),
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
