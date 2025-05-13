import type { Server } from "node:http";
import { env } from "@director.run/config/env";
import { makeEchoServer } from "@director.run/mcp/test/fixtures";
import { serveOverSSE } from "@director.run/mcp/transport";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  type IntegrationTestVariables,
  TestMCPClient,
  setupIntegrationTest,
  sseProxy,
  stdioProxy,
} from "./helpers/test-helpers";

function fooBarServerConfig() {
  return stdioProxy({
    name: "Foo",
    command: "bun",
    args: [
      "-e",
      `
      import { makeFooBarServer } from "@director.run/mcp/test/fixtures";
      import { serveOverStdio } from "@director.run/mcp/transport";
      serveOverStdio(makeFooBarServer());
    `,
    ],
  });
}

function echoServerConfig() {
  return sseProxy({
    name: "echo",
    url: `http://localhost:4521/sse`,
  });
}

describe("SSE Router", () => {
  let proxyTargetServerInstance: Server;
  let testVariables: IntegrationTestVariables;

  beforeAll(async () => {
    proxyTargetServerInstance = await serveOverSSE(makeEchoServer(), 4521);
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

    const testProxy = await testVariables.proxyStore.create({
      name: "Test Proxy",
      servers: [fooBarServerConfig(), echoServerConfig()],
    });
    const client = await TestMCPClient.connectToProxy(testProxy.id);
    const toolsResult = await client.listTools();
    const expectedToolNames = ["foo", "echo"];

    for (const toolName of expectedToolNames) {
      const tool = toolsResult.tools.find((t) => t.name === toolName);
      expect(tool).toBeDefined();
      expect(tool?.name).toBe(toolName);
    }

    expect(
      toolsResult.tools.find((t) => t.name === "foo")?.description,
    ).toContain("[foo]");
    expect(
      toolsResult.tools.find((t) => t.name === "echo")?.description,
    ).toContain("[echo]");

    await client.close();
  });

  // test("should be able to add a server to a proxy", async () => {
  //   await testVariables.proxyStore.purge();
  //   const testProxy = await testVariables.trpcClient.store.create.mutate({
  //     name: "Test Proxy",
  //     servers: [fetchProxy()],
  //   });

  //   const client = await TestMCPClient.connectToProxy(testProxy.id);
  //   const toolsResult = await client.listTools();

  //   expect(toolsResult.tools.map((t) => t.name)).toContain("fetch");
  //   expect(toolsResult.tools.map((t) => t.name)).not.toContain("get_stories");

  //   await testVariables.trpcClient.store.addServer.mutate({
  //     proxyId: testProxy.id,
  //     server: hackerNewsProxy(),
  //   });

  //   const client2 = await TestMCPClient.connectToProxy(testProxy.id);
  //   const toolsResult2 = await client2.listTools();
  //   expect(toolsResult2.tools.map((t) => t.name)).toContain("fetch");
  //   expect(toolsResult2.tools.map((t) => t.name)).toContain("get_stories");
  // });

  // test("should be able to remove a server from a proxy", async () => {
  //   await testVariables.proxyStore.purge();
  //   const testProxy = await testVariables.trpcClient.store.create.mutate({
  //     name: "Test Proxy",
  //     servers: [fetchProxy(), hackerNewsProxy()],
  //   });

  //   const client = await TestMCPClient.connectToProxy(testProxy.id);
  //   const toolsResult = await client.listTools();

  //   expect(toolsResult.tools.map((t) => t.name)).toContain("fetch");
  //   expect(toolsResult.tools.map((t) => t.name)).toContain("get_stories");

  //   await testVariables.trpcClient.store.removeServer.mutate({
  //     proxyId: testProxy.id,
  //     serverName: "hackernews",
  //   });

  //   const client2 = await TestMCPClient.connectToProxy(testProxy.id);
  //   const toolsResult2 = await client2.listTools();

  //   expect(toolsResult2.tools.map((t) => t.name)).toContain("fetch");
  //   expect(toolsResult2.tools.map((t) => t.name)).not.toContain("get_stories");
  // });
});
