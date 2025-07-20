import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { describe, expect, test } from "vitest";
import { ProxyServer } from "./proxy-server";
import { SimpleClient } from "./simple-client";
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

      const client = await SimpleClient.createAndConnectToServer(proxy);
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

    const client = await SimpleClient.createAndConnectToServer(proxy);
    const tools = await client.listTools();

    expect(tools.tools).toHaveLength(2);
    expect(tools.tools.some((tool) => tool.name === "echo")).toBe(true);
    expect(tools.tools.some((tool) => tool.name === "foo")).toBe(true);

    await streamableServerInstance.close();
    await sseServerInstance.close();
  });

  describe("add_prefix feature", () => {
    test("should prefix tool names when add_prefix is true", async () => {
      const streamableServer = await serveOverStreamable(
        makeEchoServer(),
        4524,
      );
      const sseServer = await serveOverSSE(makeFooBarServer(), 4525);

      const proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        servers: [
          {
            ...makeHTTPTargetConfig({
              name: "echo-service",
              url: `http://localhost:4524/mcp`,
            }),
            add_prefix: true,
          },
          {
            ...makeHTTPTargetConfig({
              name: "foobar-service",
              url: `http://localhost:4525/sse`,
            }),
            add_prefix: false,
          },
        ],
      });

      await proxy.connectTargets();

      const client = await SimpleClient.createAndConnectToServer(proxy);
      const tools = await client.listTools();

      expect(tools.tools).toHaveLength(2);

      // Check prefixed tool
      const echoTool = tools.tools.find((t) => t.name === "echo-service__echo");
      expect(echoTool).toBeDefined();
      expect(echoTool?.description).toContain("[echo-service]");

      // Check non-prefixed tool
      const fooTool = tools.tools.find((t) => t.name === "foo");
      expect(fooTool).toBeDefined();
      expect(fooTool?.description).toContain("[foobar-service]");

      // Verify prefixed tool is not accessible by original name
      expect(tools.tools.find((t) => t.name === "echo")).toBeUndefined();

      await streamableServer.close();
      await sseServer.close();
    });

    test("should call prefixed tools with original names", async () => {
      const streamableServer = await serveOverStreamable(
        makeEchoServer(),
        4526,
      );

      const proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        servers: [
          {
            ...makeHTTPTargetConfig({
              name: "echo-service",
              url: `http://localhost:4526/mcp`,
            }),
            add_prefix: true,
          },
        ],
      });

      await proxy.connectTargets();

      const client = await SimpleClient.createAndConnectToServer(proxy);

      // List tools first to populate the mapping
      await client.listTools();

      // Call the prefixed tool
      const result = (await client.callTool({
        name: "echo-service__echo",
        arguments: {
          message: "Hello, world!",
        },
      })) as CallToolResult;

      expect(result.content?.[0].text).toContain("Hello, world!");

      await streamableServer.close();
    });

    test("should handle multiple servers with add_prefix enabled", async () => {
      const server1 = await serveOverStreamable(makeEchoServer(), 4527);
      const server2 = await serveOverStreamable(makeFooBarServer(), 4528);

      const proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        servers: [
          {
            ...makeHTTPTargetConfig({
              name: "service-a",
              url: `http://localhost:4527/mcp`,
            }),
            add_prefix: true,
          },
          {
            ...makeHTTPTargetConfig({
              name: "service-b",
              url: `http://localhost:4528/mcp`,
            }),
            add_prefix: true,
          },
        ],
      });

      await proxy.connectTargets();

      const client = await SimpleClient.createAndConnectToServer(proxy);
      const tools = await client.listTools();

      expect(tools.tools).toHaveLength(2);
      expect(tools.tools.map((t) => t.name).sort()).toEqual([
        "service-a__echo",
        "service-b__foo",
      ]);

      await server1.close();
      await server2.close();
    });

    test("should handle mixed prefixed and non-prefixed servers", async () => {
      const echoServer1 = await serveOverStreamable(makeEchoServer(), 4529);
      const echoServer2 = await serveOverStreamable(makeEchoServer(), 4530);

      const proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        servers: [
          {
            ...makeHTTPTargetConfig({
              name: "prefixed-echo",
              url: `http://localhost:4529/mcp`,
            }),
            add_prefix: true,
          },
          {
            ...makeHTTPTargetConfig({
              name: "normal-echo",
              url: `http://localhost:4530/mcp`,
            }),
            add_prefix: false,
          },
        ],
      });

      await proxy.connectTargets();

      const client = await SimpleClient.createAndConnectToServer(proxy);
      const tools = await client.listTools();

      expect(tools.tools).toHaveLength(2);

      // Both tools should exist with different names
      expect(
        tools.tools.find((t) => t.name === "prefixed-echo__echo"),
      ).toBeDefined();
      expect(tools.tools.find((t) => t.name === "echo")).toBeDefined();

      // Both should be callable
      const result1 = (await client.callTool({
        name: "prefixed-echo__echo",
        arguments: {
          message: "Test 1",
        },
      })) as CallToolResult;
      const result2 = (await client.callTool({
        name: "echo",
        arguments: {
          message: "Test 2",
        },
      })) as CallToolResult;

      expect(result1.content?.[0].text).toContain("Test 1");
      expect(result2.content?.[0].text).toContain("Test 2");

      await echoServer1.close();
      await echoServer2.close();
    });
  });
});
