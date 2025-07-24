import { Server } from "node:http";
import { ErrorCode } from "@director.run/utilities/error";
import { expectToThrowAppError } from "@director.run/utilities/test";
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
  describe("toPlainObject", () => {
    test("should properly serialize the proxy server attributes", () => {
      const proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        servers: [
          makeHTTPTargetConfig({
            name: "streamable",
            url: `http://localhost:4522/mcp`,
          }),
          makeHTTPTargetConfig({
            name: "sse",
            url: `http://localhost:4523/sse`,
          }),
        ],
      });

      const plainObject = proxy.toPlainObject();
      expect(plainObject).toMatchObject({
        id: "test-proxy",
        name: "test-proxy",
        targets: [
          {
            name: "streamable",
            command: `http://localhost:4522/mcp`,
            status: "disconnected",
            lastConnectedAt: undefined,
            lastErrorMessage: undefined,
            type: "http",
          },
          {
            name: "sse",
            command: `http://localhost:4523/sse`,
            status: "disconnected",
            lastConnectedAt: undefined,
            lastErrorMessage: undefined,
            type: "http",
          },
        ],
      });
    });
  });

  describe("addTarget", () => {
    test("should fail when adding a target that already exists", async () => {
      const proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        servers: [],
      });

      await proxy.addTarget(
        {
          name: "streamable",
          transport: {
            type: "http",
            url: `http://localhost/mcp`,
          },
        },
        { throwOnError: false },
      );

      await expectToThrowAppError(
        () =>
          proxy.addTarget(
            {
              name: "streamable",
              transport: {
                type: "http",
                url: `http://localhost/mcp`,
              },
            },
            { throwOnError: false },
          ),
        { code: ErrorCode.DUPLICATE, props: {} },
      );
    });

    describe("when target is broken", () => {
      describe("when throwOnError === true", () => {
        test("should fail when adding a broken target", async () => {
          const proxy = new ProxyServer({
            id: "test-proxy",
            name: "test-proxy",
            servers: [],
          });

          await expectToThrowAppError(
            () =>
              proxy.addTarget(
                {
                  name: "streamable",
                  transport: {
                    type: "http",
                    url: `http://localhost/mcp`,
                  },
                },
                { throwOnError: true },
              ),
            { code: ErrorCode.CONNECTION_REFUSED, props: {} },
          );

          expect(proxy.targets.length).toBe(0);
        });
        test("should succeed when adding an unauthorized oauth target", async () => {
          const proxy = new ProxyServer({
            id: "test-proxy",
            name: "test-proxy",
            servers: [],
          });

          const target = await proxy.addTarget(
            {
              name: "streamable",
              transport: {
                type: "http",
                url: `https://mcp.notion.com/mcp`,
              },
            },
            { throwOnError: true },
          );
          expect(target.status).toBe("unauthorized");
        });
      });
      describe("when throwOnError === false", () => {
        test("should succeed when adding a oauth target", async () => {
          const proxy = new ProxyServer({
            id: "test-proxy",
            name: "test-proxy",
            servers: [],
          });

          const target = await proxy.addTarget(
            {
              name: "streamable",
              transport: {
                type: "http",
                url: `https://mcp.notion.com/mcp`,
              },
            },
            { throwOnError: false },
          );
          expect(target.status).toBe("unauthorized");
        });
        test("should succeed when adding a broken target", async () => {
          const proxy = new ProxyServer({
            id: "test-proxy",
            name: "test-proxy",
            servers: [],
          });

          const target = await proxy.addTarget(
            {
              name: "streamable",
              transport: {
                type: "http",
                url: `http://localhost/mcp`,
              },
            },
            { throwOnError: false },
          );
          expect(target.status).toBe("error");
        });
      });
    });
  });

  describe.skip("with a controller", () => {
    test("should expose controller tools via the proxy", async () => {
      // const proxy = new ProxyServer({
      //   id: "test-proxy",
      //   name: "test-proxy",
      //   servers: [],
      //   useController: true,
      // });
      // await proxy.connectTargets();
      // const client = await InMemoryClient.createAndConnectToServer(proxy);
      // const tools = await client.listTools();
      // expect(tools.tools).toHaveLength(1);
      // expect(tools.tools[0].name).toBe("list_targets");
    });
  });

  test("should proxy all transports", async () => {
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
