import { Server } from "node:http";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { InMemoryClient } from "./client/in-memory-client";
import { ProxyServer } from "./proxy-server";
import {
  makeEchoServer,
  makeFooBarServer,
  makeHTTPTargetConfig,
} from "./test/fixtures";
import { serveOverSSE, serveOverStreamable } from "./transport";

describe("ProxyServer", () => {
  describe.skip("with a controller", () => {
    test("should expose controller tools via the proxy", async () => {
      const proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        servers: [],
        useController: true,
      });
      await proxy.connectTargets();

      const client = await InMemoryClient.createAndConnectToServer(proxy);
      const tools = await client.listTools();

      expect(tools.tools).toHaveLength(1);
      expect(tools.tools[0].name).toBe("list_targets");
    });
  });

  test("should handle all transports", async () => {
    const streamableServerInstance = await serveOverStreamable(
      makeEchoServer(),
      4522,
    );
    const sseServerInstance = await serveOverSSE(makeFooBarServer(), 4523);

    const proxy = new ProxyServer({
      id: "test-proxy",
      name: "test-proxy",
      servers: [
        makeHTTPTargetConfig({
          name: "streamable",
          url: `http://localhost:4522/mcp`,
        }),
        makeHTTPTargetConfig({ name: "sse", url: `http://localhost:4523/sse` }),
      ],
    });

    await proxy.connectTargets();

    const client = await InMemoryClient.createAndConnectToServer(proxy);
    const tools = await client.listTools();

    expect(tools.tools).toHaveLength(2);
    expect(tools.tools.some((tool) => tool.name === "echo")).toBe(true);
    expect(tools.tools.some((tool) => tool.name === "foo")).toBe(true);

    await streamableServerInstance.close();
    await sseServerInstance.close();
  });

  describe("tool prefixing", () => {
    let echoServer: Server;
    let fooServer: Server;

    beforeAll(async () => {
      echoServer = await serveOverStreamable(makeEchoServer(), 4524);
      fooServer = await serveOverSSE(makeFooBarServer(), 4525);
    });

    afterAll(async () => {
      await echoServer.close();
      await fooServer.close();
    });

    test("should call prefixed tools with original names", async () => {
      const proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        addToolPrefix: true,
        servers: [
          {
            ...makeHTTPTargetConfig({
              name: "echo-service",
              url: `http://localhost:4524/mcp`,
            }),
          },
        ],
      });

      await proxy.connectTargets();
      const client = await InMemoryClient.createAndConnectToServer(proxy);
      await client.listTools();

      const result = (await client.callTool({
        name: "echo-service__echo",
        arguments: {
          message: "Hello, world!",
        },
      })) as CallToolResult;

      expect(result.content?.[0].text).toContain("Hello, world!");
    });

    test("should prefix tool names when addToolPrefix = true", async () => {
      const proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        addToolPrefix: true,
        servers: [
          {
            ...makeHTTPTargetConfig({
              name: "service-a",
              url: `http://localhost:4524/mcp`,
            }),
          },
          {
            ...makeHTTPTargetConfig({
              name: "service-b",
              url: `http://localhost:4525/sse`,
            }),
          },
        ],
      });

      await proxy.connectTargets();

      const client = await InMemoryClient.createAndConnectToServer(proxy);
      const tools = await client.listTools();

      expect(tools.tools).toHaveLength(2);
      expect(tools.tools.map((t) => t.name).sort()).toEqual([
        "service-a__echo",
        "service-b__foo",
      ]);
    });

    test("should not prefix tool names when addToolPrefix = false", async () => {
      const proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        addToolPrefix: false,
        servers: [
          {
            ...makeHTTPTargetConfig({
              name: "service-a",
              url: `http://localhost:4524/mcp`,
            }),
          },
          {
            ...makeHTTPTargetConfig({
              name: "service-b",
              url: `http://localhost:4525/sse`,
            }),
          },
        ],
      });

      await proxy.connectTargets();

      const client = await InMemoryClient.createAndConnectToServer(proxy);
      const tools = await client.listTools();

      expect(tools.tools).toHaveLength(2);
      expect(tools.tools.map((t) => t.name).sort()).toEqual(["echo", "foo"]);
    });
  });
});
