import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { z } from "zod";
import { env } from "./config";
import {
  type IntegrationTestVariables,
  TestMCPClient,
  createMCPServer,
  fetchProxy,
  hackerNewsProxy,
  setupIntegrationTest,
  sseProxy,
} from "./helpers/test-helpers";

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
      client.connectToURL(
        `http://localhost:${env.SERVER_PORT}/not_existing_proxy/sse`,
      ),
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
    await client.connectToURL(
      `http://localhost:${env.SERVER_PORT}/test-proxy/sse`,
    );

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

  test("should be able to add a server to a proxy", async () => {
    await testVariables.proxyStore.purge();
    const testProxy = await testVariables.trpcClient.store.create.mutate({
      name: "Test Proxy",
      servers: [fetchProxy()],
    });

    const client = new TestMCPClient();
    await client.connectToURL(
      `http://localhost:${env.SERVER_PORT}/test-proxy/sse`,
    );

    const toolsResult = await client.listTools();

    expect(toolsResult.tools.map((t) => t.name)).toContain("fetch");
    expect(toolsResult.tools.map((t) => t.name)).not.toContain("get_stories");

    await testVariables.trpcClient.store.addServer.mutate({
      proxyId: testProxy.id,
      server: hackerNewsProxy(),
    });

    const client2 = new TestMCPClient();
    await client2.connectToURL(
      `http://localhost:${env.SERVER_PORT}/test-proxy/sse`,
    );

    const toolsResult2 = await client2.listTools();
    expect(toolsResult2.tools.map((t) => t.name)).toContain("fetch");
    expect(toolsResult2.tools.map((t) => t.name)).toContain("get_stories");
  });

  test("should be able to remove a server from a proxy", async () => {
    await testVariables.proxyStore.purge();
    const testProxy = await testVariables.trpcClient.store.create.mutate({
      name: "Test Proxy",
      servers: [fetchProxy(), hackerNewsProxy()],
    });

    const client = new TestMCPClient();
    await client.connectToURL(
      `http://localhost:${env.SERVER_PORT}/test-proxy/sse`,
    );

    const toolsResult = await client.listTools();

    expect(toolsResult.tools.map((t) => t.name)).toContain("fetch");
    expect(toolsResult.tools.map((t) => t.name)).toContain("get_stories");

    await testVariables.trpcClient.store.removeServer.mutate({
      proxyId: testProxy.id,
      serverName: "hackernews",
    });

    const client2 = new TestMCPClient();
    await client2.connectToURL(
      `http://localhost:${env.SERVER_PORT}/test-proxy/sse`,
    );

    const toolsResult2 = await client2.listTools();

    console.log(toolsResult2.tools.map((t) => t.name));

    expect(toolsResult2.tools.map((t) => t.name)).toContain("fetch");
    expect(toolsResult2.tools.map((t) => t.name)).not.toContain("get_stories");
  });
});
