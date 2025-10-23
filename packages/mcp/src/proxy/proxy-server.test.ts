import { Server } from "node:http";
import { ErrorCode } from "@director.run/utilities/error";
import { expectToThrowAppError } from "@director.run/utilities/test";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";
import { HTTPClient } from "../client/http-client";
import { InMemoryClient } from "../client/in-memory-client";
import { OAuthProviderFactory } from "../oauth/oauth-provider-factory";
import { makeEchoServer, makeKitchenSinkServer } from "../test/fixtures";
import {
  expectListToolsToReturnToolNames,
  expectToolCallToHaveResult,
  expectUnknownToolError,
} from "../test/helpers";
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
    sseInstance = await serveOverSSE(makeKitchenSinkServer(), SSE_PORT);
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
        servers: [],
      });
    });

    describe("getTarget", () => {
      test("should return the target or throw an error if it doesn't exist", async () => {
        await proxy.addTarget(
          new HTTPClient({
            name: "streamable",
            url: `http://localhost/mcp`,
          }),
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
      test("should support adding InMemoryClient instances", async () => {
        const client = new InMemoryClient(
          {
            name: "test-client",
          },
          {
            server: makeKitchenSinkServer(),
          },
        );
        await proxy.addTarget(client);
        expect(client.status).toBe("connected");
        expect(proxy.targets.length).toBe(1);
        expect(proxy.targets[0]).toBe(client);
        expect(await proxy.getTarget("test-client")).toEqual(client);
        expectListToolsToReturnToolNames(client, [
          "add",
          "subtract",
          "multiply",
          "ping",
        ]);
      });

      test("should throw an error if the target already exists", async () => {
        await proxy.addTarget(
          new HTTPClient({
            name: "streamable",
            url: `http://localhost/mcp`,
          }),
          { throwOnError: false },
        );

        await expectToThrowAppError(
          () =>
            proxy.addTarget(
              new HTTPClient({
                name: "streamable",
                url: `http://localhost/mcp`,
              }),
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
                  new HTTPClient({
                    name: "streamable",
                    url: `http://localhost/mcp`,
                  }),
                  { throwOnError: true },
                ),
              { code: ErrorCode.CONNECTION_REFUSED, props: {} },
            );
            expect(proxy.targets.length).toBe(0);
          });
          test("should succeed when adding an unauthorized oauth target", async () => {
            const proxy = new ProxyServer({
              id: "test-proxy",
              servers: [],
            });

            const target = await proxy.addTarget(
              new HTTPClient(
                {
                  name: "streamable",
                  url: `https://mcp.notion.com/mcp`,
                },
                {
                  oAuthHandler: new OAuthProviderFactory({
                    storage: "memory",
                    baseCallbackUrl: "http://localhost:8999",
                  }),
                },
              ),
              { throwOnError: true },
            );
            expect(target.status).toBe("unauthorized");
          });
        });
        describe("when throwOnError === false", () => {
          test("should succeed when adding a oauth target", async () => {
            const proxy = new ProxyServer({
              id: "test-proxy",
              servers: [],
            });

            const target = await proxy.addTarget(
              new HTTPClient(
                {
                  name: "streamable",
                  url: `https://mcp.notion.com/mcp`,
                },
                {
                  oAuthHandler: new OAuthProviderFactory({
                    storage: "memory",
                    baseCallbackUrl: "http://localhost:8999",
                  }),
                },
              ),
              { throwOnError: false },
            );
            expect(target.status).toBe("unauthorized");
          });
          test("should not throw an exception when adding a broken target", async () => {
            const proxy = new ProxyServer({
              id: "test-proxy",
              servers: [],
            });

            const target = await proxy.addTarget(
              new HTTPClient({
                name: "streamable",
                url: `http://localhost/mcp`,
              }),
              { throwOnError: false },
            );
            expect(target.status).toBe("error");
          });
        });
      });
    });
  });

  describe("proxying", () => {
    let proxy: ProxyServer;

    beforeEach(() => {
      proxy = new ProxyServer({
        id: "test-proxy",
        servers: [
          new HTTPClient({
            name: "streamable",
            url: `http://localhost:${STREAMABLE_PORT}/mcp`,
          }),
          new HTTPClient({
            name: "sse",
            url: `http://localhost:${SSE_PORT}/sse`,
          }),
        ],
      });
    });

    test("should proxy all transports", async () => {
      await proxy.connectTargets();
      const client = await InMemoryClient.createAndConnectToServer(proxy);

      await expectListToolsToReturnToolNames(client, [
        "echo",
        "add",
        "subtract",
        "multiply",
        "ping",
      ]);

      await client.close();
    });

    describe("disabled tools", () => {
      let proxy: ProxyServer;
      let client: InMemoryClient;

      beforeEach(async () => {
        proxy = new ProxyServer({
          id: "test-proxy",
          servers: [
            new HTTPClient({
              name: "echo",
              url: `http://localhost:${STREAMABLE_PORT}/mcp`,
            }),
            new HTTPClient({
              name: "kitchen-sink",
              url: `http://localhost:${SSE_PORT}/sse`,
              tools: { exclude: ["add", "subtract"] },
            }),
          ],
        });
        await proxy.connectTargets();
        client = await InMemoryClient.createAndConnectToServer(proxy);
      });

      afterEach(async () => {
        await client.close();
        await proxy.close();
      });

      test("should not return disabled tools", async () => {
        await expectListToolsToReturnToolNames(client, [
          "echo",
          "multiply",
          "ping",
        ]);
      });

      test("should be able to re-enable disabled tools", async () => {
        await proxy.updateTarget("kitchen-sink", {
          tools: { exclude: [] },
        });
        await expectListToolsToReturnToolNames(client, [
          "echo",
          "add",
          "subtract",
          "multiply",
          "ping",
        ]);
      });

      test("should fail when calling disabled tools", async () => {
        await expectUnknownToolError({
          client,
          toolName: "add",
          arguments: {},
        });
      });
    });

    describe("tool prefixing", () => {
      let client: InMemoryClient;
      let proxy: ProxyServer;

      beforeEach(async () => {
        proxy = new ProxyServer({
          id: "test-proxy",
          servers: [
            new HTTPClient({
              name: "echo",
              url: `http://localhost:${STREAMABLE_PORT}/mcp`,
              tools: { prefix: "a__" },
            }),
            new HTTPClient({
              name: "kitchen-sink",
              url: `http://localhost:${SSE_PORT}/sse`,
              tools: { prefix: "b__" },
            }),
          ],
        });

        await proxy.connectTargets();
        client = await InMemoryClient.createAndConnectToServer(proxy);
      });

      afterEach(async () => {
        await client.close();
        await proxy.close();
      });

      test("should be able to remove the prefix", async () => {
        await proxy.updateTarget("echo", {
          tools: { prefix: "" },
        });
        await expectListToolsToReturnToolNames(client, [
          "echo",
          "b__add",
          "b__subtract",
          "b__multiply",
          "b__ping",
        ]);
      });

      test("should support calling prefixed tools", async () => {
        await expectToolCallToHaveResult({
          client,
          toolName: "a__echo",
          arguments: {
            message: "Hello, world!",
          },
          expectedResult: {
            message: "Hello, world!",
          },
        });
      });

      test("should list prefixed tools", async () => {
        await expectListToolsToReturnToolNames(client, [
          "a__echo",
          "b__add",
          "b__subtract",
          "b__multiply",
          "b__ping",
        ]);
      });
    });

    describe("disabled targets", () => {
      let client: InMemoryClient;
      let proxy: ProxyServer;

      beforeEach(async () => {
        proxy = new ProxyServer({
          id: "test-proxy",
          servers: [
            new HTTPClient({
              name: "echo",
              url: `http://localhost:${STREAMABLE_PORT}/mcp`,
            }),
            new HTTPClient({
              name: "kitchen-sink",
              url: `http://localhost:${SSE_PORT}/sse`,
              disabled: true,
            }),
          ],
        });

        await proxy.connectTargets();
        client = await InMemoryClient.createAndConnectToServer(proxy);
      });

      afterEach(async () => {
        await client.close();
        await proxy.close();
      });

      test("should not connect disabled targets", async () => {
        const target = await proxy.getTarget("kitchen-sink");
        expect(target.status).toBe("disconnected");
      });

      test("should fail when calling tools on a disabled target", async () => {
        await expectUnknownToolError({
          client,
          toolName: "add",
          arguments: {},
        });
      });

      test("should not list tools on a disabled target", async () => {
        await expectListToolsToReturnToolNames(client, ["echo"]);
      });

      test("should disconnect when disabling a target", async () => {
        const result = await proxy.updateTarget("echo", {
          disabled: true,
        });
        expect(result.status).toBe("disconnected");
        expect((await proxy.getTarget("echo")).status).toBe("disconnected");
      });

      test("should be able to re-enable a disabled target", async () => {
        await proxy.updateTarget("kitchen-sink", {
          disabled: false,
        });
        await expectListToolsToReturnToolNames(client, [
          "echo",
          "add",
          "subtract",
          "multiply",
          "ping",
        ]);
      });

      test("should reconnect when re-enabling a disabled target", async () => {
        const result = await proxy.updateTarget("kitchen-sink", {
          disabled: false,
        });
        expect(result.status).toBe("connected");
        const target = await proxy.getTarget("kitchen-sink");
        expect(target.status).toBe("connected");
      });
    });
  });
});
