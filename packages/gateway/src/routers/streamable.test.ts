import type { Server } from "node:http";
import { SimpleClient } from "@director.run/mcp/simple-client";
import { makeEchoServer } from "@director.run/mcp/test/fixtures";
import { serveOverSSE } from "@director.run/mcp/transport";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  makeFooBarServerStdioConfig,
  makeHTTPTargetConfig,
} from "../test/fixtures";
import { IntegrationTestHarness } from "../test/integration";

const PROXY_TARGET_PORT = 4521;

const echoServerSSEConfig = makeHTTPTargetConfig({
  name: "echo",
  url: `http://localhost:${PROXY_TARGET_PORT}/sse`,
});

describe("Streamable Router", () => {
  let proxyTargetServerInstance: Server;
  let harness: IntegrationTestHarness;

  beforeAll(async () => {
    proxyTargetServerInstance = await serveOverSSE(
      makeEchoServer(),
      PROXY_TARGET_PORT,
    );
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
    await proxyTargetServerInstance?.close();
  });

  test("should return 404 when proxy not found", async () => {
    const res = await fetch(
      `http://localhost:${harness.gateway.port}/not_existing_proxy/mcp`,
    );
    expect(res.status).toEqual(404);
    expect(res.ok).toBeFalsy();
  });

  test("should connect and list tools", async () => {
    await harness.purge();

    const testProxy = await harness.client.store.create.mutate({
      name: "Test Proxy",
      servers: [makeFooBarServerStdioConfig(), echoServerSSEConfig],
    });

    const client = await SimpleClient.createAndConnectToHTTP(
      `http://localhost:${harness.gateway.port}/${testProxy.id}/mcp`,
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

  describe("addServer", () => {
    test("should be able to add a server to a proxy", async () => {
      await harness.purge();
      const testProxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [makeFooBarServerStdioConfig()],
      });

      const client = await SimpleClient.createAndConnectToHTTP(
        `http://localhost:${harness.gateway.port}/${testProxy.id}/mcp`,
      );

      const toolsResult = await client.listTools();

      expect(toolsResult.tools.map((t) => t.name)).toContain("foo");
      expect(toolsResult.tools.map((t) => t.name)).not.toContain("echo");

      await harness.client.store.addServer.mutate({
        proxyId: testProxy.id,
        server: echoServerSSEConfig,
      });

      const client2 = await SimpleClient.createAndConnectToHTTP(
        `http://localhost:${harness.gateway.port}/${testProxy.id}/mcp`,
      );

      const toolsResult2 = await client2.listTools();
      expect(toolsResult2.tools.map((t) => t.name)).toContain("foo");
      expect(toolsResult2.tools.map((t) => t.name)).toContain("echo");
    });

    test("should fail if server already exists", async () => {
      await harness.purge();
      const testServerConfig = makeFooBarServerStdioConfig();
      const testProxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [testServerConfig],
      });

      await expect(
        harness.client.store.addServer.mutate({
          proxyId: testProxy.id,
          server: testServerConfig,
        }),
      ).rejects.toThrow();
    });
  });

  describe("removeServer", () => {
    test("should be able to remove a server from a proxy", async () => {
      await harness.purge();
      const testProxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [echoServerSSEConfig, makeFooBarServerStdioConfig()],
      });

      const client = await SimpleClient.createAndConnectToHTTP(
        `http://localhost:${harness.gateway.port}/${testProxy.id}/mcp`,
      );
      const toolsResult = await client.listTools();

      expect(toolsResult.tools.map((t) => t.name)).toContain("foo");
      expect(toolsResult.tools.map((t) => t.name)).toContain("echo");

      await harness.client.store.removeServer.mutate({
        proxyId: testProxy.id,
        serverName: "echo",
      });

      const client2 = await SimpleClient.createAndConnectToHTTP(
        `http://localhost:${harness.gateway.port}/${testProxy.id}/mcp`,
      );
      const toolsResult2 = await client2.listTools();

      expect(toolsResult2.tools.map((t) => t.name)).toContain("foo");
      expect(toolsResult2.tools.map((t) => t.name)).not.toContain("echo");
    });
    test("should fail if server does not exist", async () => {
      await harness.purge();
      const testProxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [],
      });

      await expect(
        harness.client.store.removeServer.mutate({
          proxyId: testProxy.id,
          serverName: "echo",
        }),
      ).rejects.toThrow();
    });
  });
});
