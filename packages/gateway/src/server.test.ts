import type { Server } from "node:http";
import { SimpleClient } from "@director.run/mcp/simple-client";
import { makeEchoServer } from "@director.run/mcp/test/fixtures";
import { serveOverSSE } from "@director.run/mcp/transport";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  makeFooBarServerStdioConfig,
  makeSSETargetConfig,
} from "./test/fixtures";
import { IntegrationTestHarness } from "./test/integration";

const PROXY_TARGET_PORT = 4521;

const echoServerSSEConfig = makeSSETargetConfig({
  name: "echo",
  url: `http://localhost:${PROXY_TARGET_PORT}/sse`,
});

describe("SSE Router", () => {
  let proxyTargetServerInstance: Server;
  let testVariables: IntegrationTestHarness;

  beforeAll(async () => {
    proxyTargetServerInstance = await serveOverSSE(
      makeEchoServer(),
      PROXY_TARGET_PORT,
    );
    testVariables = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await testVariables.stop();
    await proxyTargetServerInstance?.close();
  });

  test("should return 404 when proxy not found", async () => {
    const res = await fetch(
      `http://localhost:${testVariables.gateway.port}/not_existing_proxy/sse`,
    );
    expect(res.status).toEqual(404);
    expect(res.ok).toBeFalsy();
  });

  test("should connect and list tools", async () => {
    await testVariables.client.debug?.purge.mutate();

    const testProxy = await testVariables.client.store.create.mutate({
      name: "Test Proxy",
      servers: [makeFooBarServerStdioConfig(), echoServerSSEConfig],
    });

    const client = await SimpleClient.createAndConnectToSSE(
      `http://localhost:${testVariables.gateway.port}/${testProxy.id}/sse`,
    );

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

  test("should be able to add a server to a proxy", async () => {
    await testVariables.client.debug?.purge.mutate();
    const testProxy = await testVariables.client.store.create.mutate({
      name: "Test Proxy",
      servers: [makeFooBarServerStdioConfig()],
    });

    const client = await SimpleClient.createAndConnectToSSE(
      `http://localhost:${testVariables.gateway.port}/${testProxy.id}/sse`,
    );

    const toolsResult = await client.listTools();

    expect(toolsResult.tools.map((t) => t.name)).toContain("foo");
    expect(toolsResult.tools.map((t) => t.name)).not.toContain("echo");

    await testVariables.client.store.addServer.mutate({
      proxyId: testProxy.id,
      server: echoServerSSEConfig,
    });

    const client2 = await SimpleClient.createAndConnectToSSE(
      `http://localhost:${testVariables.gateway.port}/${testProxy.id}/sse`,
    );

    const toolsResult2 = await client2.listTools();
    expect(toolsResult2.tools.map((t) => t.name)).toContain("foo");
    expect(toolsResult2.tools.map((t) => t.name)).toContain("echo");
  });

  test("should be able to remove a server from a proxy", async () => {
    await testVariables.client.debug?.purge.mutate();
    const testProxy = await testVariables.client.store.create.mutate({
      name: "Test Proxy",
      servers: [echoServerSSEConfig, makeFooBarServerStdioConfig()],
    });

    const client = await SimpleClient.createAndConnectToSSE(
      `http://localhost:${testVariables.gateway.port}/${testProxy.id}/sse`,
    );
    const toolsResult = await client.listTools();

    expect(toolsResult.tools.map((t) => t.name)).toContain("foo");
    expect(toolsResult.tools.map((t) => t.name)).toContain("echo");

    await testVariables.client.store.removeServer.mutate({
      proxyId: testProxy.id,
      serverName: "echo",
    });

    const client2 = await SimpleClient.createAndConnectToSSE(
      `http://localhost:${testVariables.gateway.port}/${testProxy.id}/sse`,
    );
    const toolsResult2 = await client2.listTools();

    expect(toolsResult2.tools.map((t) => t.name)).toContain("foo");
    expect(toolsResult2.tools.map((t) => t.name)).not.toContain("echo");
  });
});
