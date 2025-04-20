import type { Server } from "node:http";
import { PORT } from "@/helpers/env";
import {
  type IntegrationTestVariables,
  TestMCPClient,
  createMCPServer,
  fetchProxy,
  hackerNewsProxy,
  setupIntegrationTest,
  sseProxy,
} from "@/helpers/test-helpers";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { z } from "zod";

describe("SSE Router", () => {
  let proxyTargetServerInstance: Server;
  let testVariables: IntegrationTestVariables;

  beforeAll(async () => {
    proxyTargetServerInstance = await createMCPServer(4521, (server) => {
      server.tool("echo", { message: z.string() }, async ({ message }) => ({
        content: [{ type: "text", text: `Tool echo: ${message}` }],
      }));
    });

    testVariables = await setupIntegrationTest();
  });

  afterAll(async () => {
    await testVariables.close();
    await proxyTargetServerInstance?.close();
  });

  test("should return 404 when proxy not found", async () => {
    const client = new TestMCPClient();
    await expect(
      client.connectToURL(`http://localhost:${PORT}/not_existing_proxy/sse`),
    ).rejects.toMatchObject({
      code: 404,
    });
  });

  test("should connect and list tools", async () => {
    await testVariables.proxyStore.purge();
    await testVariables.proxyStore.create({
      name: "Test Proxy",
      servers: [
        hackerNewsProxy(),
        fetchProxy(),
        sseProxy("http://localhost:4521/sse"),
      ],
    });

    const client = new TestMCPClient();
    await client.connectToURL(`http://localhost:${PORT}/test-proxy/sse`);

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
