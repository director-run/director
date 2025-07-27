import { Server } from "node:http";
import { ErrorCode } from "@director.run/utilities/error";
import { expectToThrowAppError } from "@director.run/utilities/test";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { InMemoryClient } from "../client/in-memory-client";
import { OAuthHandler } from "../oauth/oauth-provider-factory";
import {
  makeEchoServer,
  makeFooBarServer,
  makeHTTPTargetConfig,
} from "../test/fixtures";
import { serveOverSSE, serveOverStreamable } from "../transport";
import { ProxyServer } from "./proxy-server";

describe("ProxyServer", () => {
  describe("getTarget", () => {
    test("should return the target or throw an error if it doesn't exist", async () => {
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

      const target = await proxy.getTarget("streamable");
      expect(target).toBeDefined();

      await expectToThrowAppError(() => proxy.getTarget("random"), {
        code: ErrorCode.NOT_FOUND,
        props: {},
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

  describe("disabled tools", () => {
    let echoServer: Server;
    let fooServer: Server;
    let client: InMemoryClient;

    beforeAll(async () => {
      echoServer = await serveOverStreamable(makeEchoServer(), 4528);
      fooServer = await serveOverSSE(makeFooBarServer(), 4529);
      const proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        servers: [
          {
            ...makeHTTPTargetConfig({
              name: "echo",
              url: `http://localhost:4528/mcp`,
            }),
            disabledTools: ["echo"],
          },
          {
            ...makeHTTPTargetConfig({
              name: "foo",
              url: `http://localhost:4529/sse`,
            }),
          },
        ],
      });

      await proxy.connectTargets();
      client = await InMemoryClient.createAndConnectToServer(proxy);
    });

    afterAll(async () => {
      await client.close();
      await echoServer.close();
      await fooServer.close();
    });

    test("should not return disabled tools", async () => {
      const tools = await client.listTools();
      expect(tools.tools).toHaveLength(1);
      expect(tools.tools.map((t) => t.name).sort()).toEqual(["foo"]);
    });
  });

  describe("tool prefixing", () => {
    let echoServer: Server;
    let fooServer: Server;
    let client: InMemoryClient;

    beforeAll(async () => {
      echoServer = await serveOverStreamable(makeEchoServer(), 4524);
      fooServer = await serveOverSSE(makeFooBarServer(), 4525);
      const proxy = new ProxyServer({
        id: "test-proxy",
        name: "test-proxy",
        servers: [
          {
            ...makeHTTPTargetConfig({
              name: "echo",
              url: `http://localhost:4524/mcp`,
            }),
            toolPrefix: "a__",
          },
          {
            ...makeHTTPTargetConfig({
              name: "foo",
              url: `http://localhost:4525/sse`,
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
      await echoServer.close();
      await fooServer.close();
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

  describe("updateTarget", () => {
    test.skip("should update tool prefix", () => {});
  });
});
