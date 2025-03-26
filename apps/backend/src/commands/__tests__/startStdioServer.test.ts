import type { Server } from "node:http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { createProxyTargetServer } from "./createProxyTargetServer";

describe("startStdioServer", () => {
  let client: Client;
  let transport: StdioClientTransport;
  let proxyTargetServerInstance: Server;

  beforeAll(async () => {
    proxyTargetServerInstance = await createProxyTargetServer();

    client = new Client(
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

    transport = new StdioClientTransport({
      command: "bun",
      args: ["cli", "start", "test-proxy", "--transport", "stdio"],
      env: {
        ...process.env,
        NODE_ENV: "test",
      },
    });

    await client.connect(transport);
  }, 30000);

  afterAll(async () => {
    await client?.close();
    await proxyTargetServerInstance?.close();
  });

  test("should connect and list tools", async () => {
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
  }, 30000);
});
