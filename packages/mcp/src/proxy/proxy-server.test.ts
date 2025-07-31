import { Server } from "node:http";
import { ErrorCode } from "@director.run/utilities/error";
import { expectToThrowAppError } from "@director.run/utilities/test";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";
import { InMemoryClient } from "../client/in-memory-client";
import { OAuthHandler } from "../oauth/oauth-provider-factory";
import {
  makeEchoServer,
  makeFooBarServer,
  makeHTTPTargetConfig,
} from "../test/fixtures";
import { serveOverSSE, serveOverStreamable } from "../transport";
import { ProxyServer } from "./proxy-server";

const STREAMABLE_PORT = 2345;
const SSE_PORT = STREAMABLE_PORT + 1;

describe("ProxyServer", () => {
  let streamableInstance: Server;
  let sseInstance: Server;

  beforeAll(async () => {
    streamableInstance = await serveOverStreamable(
      makeEchoServer(),
      STREAMABLE_PORT,
    );
    sseInstance = await serveOverSSE(makeFooBarServer(), SSE_PORT);
  });

  afterAll(async () => {
    await streamableInstance.close();
    await sseInstance.close();
  });

  describe("CRUD", () => {
    let proxy: ProxyServer;

    beforeEach(() => {
      proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        servers: [],
      });
    });

    describe("getTarget", () => {
      test("should return the target or throw an error if it doesn't exist", async () => {
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

        const target = await proxy.getTarget("streamable");
        expect(target).toBeDefined();
      });

      test("should throw an error if it doesn't exist", async () => {
        await expectToThrowAppError(() => proxy.getTarget("random"), {
          code: ErrorCode.NOT_FOUND,
          props: {},
        });
      });
    });

    describe("addTarget", () => {
      test("should throw an error if the target already exists", async () => {
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

      describe("broken targets", () => {
        describe("when throwOnError === true", () => {
          test("should throw an exception", async () => {
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
            const proxy = new ProxyServer(
              {
                id: "test-proxy",
                name: "test-proxy",
                servers: [],
              },
              {
                oAuthHandler: OAuthHandler.createMemoryBackedHandler({
                  baseCallbackUrl: "http://localhost:8999",
                }),
              },
            );

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
            const proxy = new ProxyServer(
              {
                id: "test-proxy",
                name: "test-proxy",
                servers: [],
              },
              {
                oAuthHandler: OAuthHandler.createMemoryBackedHandler({
                  baseCallbackUrl: "http://localhost:8999",
                }),
              },
            );

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
          test("should not throw an exception when adding a broken target", async () => {
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

    describe("update", () => {
      test("should update name and description", () => {
        const proxy = new ProxyServer({
          id: "test-proxy",
          name: "test-proxy",
          description: "old description",
          servers: [],
        });

        expect(proxy.name).toBe("test-proxy");
        expect(proxy.description).toBe("old description");

        proxy.update({
          name: "updated-proxy",
          description: "new description",
        });
        expect(proxy.name).toBe("updated-proxy");
        expect(proxy.description).toBe("new description");
      });
    });
  });

  test("should proxy all transports", async () => {
    const proxy = new ProxyServer({
      id: "test-proxy",
      name: "test-proxy",
      servers: [
        makeHTTPTargetConfig({
          name: "streamable",
          url: `http://localhost:${STREAMABLE_PORT}/mcp`,
        }),
        makeHTTPTargetConfig({
          name: "sse",
          url: `http://localhost:${SSE_PORT}/sse`,
        }),
      ],
    });

    await proxy.connectTargets();

    const client = await InMemoryClient.createAndConnectToServer(proxy);
    const tools = await client.listTools();

    expect(tools.tools).toHaveLength(2);
    expect(tools.tools.some((tool) => tool.name === "echo")).toBe(true);
    expect(tools.tools.some((tool) => tool.name === "foo")).toBe(true);
  });

  describe("disabled tools", () => {
    let client: InMemoryClient;

    beforeAll(async () => {
      const proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        servers: [
          {
            ...makeHTTPTargetConfig({
              name: "echo",
              url: `http://localhost:${STREAMABLE_PORT}/mcp`,
            }),
            disabledTools: ["echo"],
          },
          {
            ...makeHTTPTargetConfig({
              name: "foo",
              url: `http://localhost:${SSE_PORT}/sse`,
            }),
          },
        ],
      });

      await proxy.connectTargets();
      client = await InMemoryClient.createAndConnectToServer(proxy);
    });

    afterAll(async () => {
      await client.close();
    });

    test("should not return disabled tools", async () => {
      const tools = await client.listTools();
      expect(tools.tools).toHaveLength(1);
      expect(tools.tools.map((t) => t.name).sort()).toEqual(["foo"]);
    });
  });

  describe("tool prefixing", () => {
    let client: InMemoryClient;

    beforeAll(async () => {
      const proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        servers: [
          {
            ...makeHTTPTargetConfig({
              name: "echo",
              url: `http://localhost:${STREAMABLE_PORT}/mcp`,
            }),
            toolPrefix: "a__",
          },
          {
            ...makeHTTPTargetConfig({
              name: "foo",
              url: `http://localhost:${SSE_PORT}/sse`,
            }),
            toolPrefix: "b__",
          },
        ],
      });

      await proxy.connectTargets();
      client = await InMemoryClient.createAndConnectToServer(proxy);
    });

    afterAll(async () => {
      await client.close();
    });

    test("should support calling prefixed tools", async () => {
      await client.listTools();

      const result = (await client.callTool({
        name: "a__echo",
        arguments: {
          message: "Hello, world!",
        },
      })) as CallToolResult;

      expect(result.content?.[0].text).toContain("Hello, world!");
    });

    test("should support listing prefixed tools", async () => {
      const tools = await client.listTools();

      expect(tools.tools).toHaveLength(2);
      expect(tools.tools.map((t) => t.name).sort()).toEqual([
        "a__echo",
        "b__foo",
      ]);
    });
  });

  describe("updateTarget", () => {
    test.skip("should update tool prefix", () => {});
  });
});
