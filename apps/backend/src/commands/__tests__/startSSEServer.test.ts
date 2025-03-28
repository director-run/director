import type { Server } from "node:http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { SSE_PORT } from "../../env.js";
import { startSSEServer } from "../startSSEServer.js";
import { createProxyTargetServer } from "./createProxyTargetServer.js";

describe("startSSEServer", () => {
  let serverInstance: Server;
  let proxyTargetServerInstance: Server;

  beforeAll(async () => {
    proxyTargetServerInstance = await createProxyTargetServer();
    serverInstance = await startSSEServer("test-proxy");
  });

  afterAll(async () => {
    await serverInstance?.close();
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
      new URL(`http://localhost:${SSE_PORT}/sse`),
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
