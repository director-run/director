import type { Server } from "node:http";
import { HTTPClient } from "@director.run/mcp/client/http-client";
import {
  makeEchoServer,
  makeFooBarServer,
  makeHTTPTargetConfig,
  makeKitchenSinkServer,
} from "@director.run/mcp/test/fixtures";
import { serveOverSSE, serveOverStreamable } from "@director.run/mcp/transport";
import type { ProxyServerAttributes } from "@director.run/utilities/schema";
import {
  type CallToolResult,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { IntegrationTestHarness } from "./test/integration";

const PROXY_TARGET_PORT = 4521;
const echoServerSSEConfig = makeHTTPTargetConfig({
  name: "echo",
  url: `http://localhost:${PROXY_TARGET_PORT}/sse`,
});

const kitchenSinkServerConfig = makeHTTPTargetConfig({
  name: "kitchen-sink",
  url: `http://localhost:${PROXY_TARGET_PORT + 1}/mcp`,
});

const fooBarServerConfig = makeHTTPTargetConfig({
  name: "foobar",
  url: `http://localhost:${PROXY_TARGET_PORT + 2}/mcp`,
});

enum Transport {
  SSE = "sse",
  STREAMABLE = "streamable",
}

function getProxyUrl(transport: Transport, proxyId: string) {
  return `http://localhost:${IntegrationTestHarness.gatewayPort}/${proxyId}/${transport === Transport.SSE ? "sse" : "mcp"}`;
}

async function createProxyClient(transport: Transport, proxyId: string) {
  return await HTTPClient.createAndConnectToHTTP(
    getProxyUrl(transport, proxyId),
  );
}

async function expectListToolsToReturnToolNames(
  client: HTTPClient,
  expectedToolNames: string[],
) {
  const toolsResult = await client.listTools();
  const actualToolNames = toolsResult.tools.map((t) => t.name);

  expect(actualToolNames.sort()).toEqual(expectedToolNames.sort());
}

async function expectToolCallToHaveResult(params: {
  client: HTTPClient;
  toolName: string;
  arguments: Record<string, unknown>;
  expectedResult: unknown;
}) {
  // TODO: this needs to be called first otherwise the tool is not available as it's lazy caching
  await params.client.listTools();

  const result = (await params.client.callTool({
    name: params.toolName,
    arguments: params.arguments,
  })) as CallToolResult;

  expect(JSON.parse(result.content?.[0].text as string)).toEqual(
    params.expectedResult,
  );
}

async function expectUnknownToolError(params: {
  client: HTTPClient;
  toolName: string;
  arguments: Record<string, unknown>;
}) {
  const error = await params.client
    .callTool({
      name: params.toolName,
      arguments: params.arguments,
    })
    .catch((e) => e);
  expect(error).toBeInstanceOf(McpError);
  expect((error as McpError).code).toEqual(ErrorCode.InternalError);
  expect((error as McpError).message).toContain("Unknown tool");
}

describe("MCP Proxy", () => {
  let harness: IntegrationTestHarness;
  let echoServerSSEInstance: Server;
  let kitchenSinkServerInstance: Server;
  let fooBarServerInstance: Server;
  let proxy: ProxyServerAttributes;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
    echoServerSSEInstance = await serveOverSSE(
      makeEchoServer(),
      PROXY_TARGET_PORT,
    );
    kitchenSinkServerInstance = await serveOverStreamable(
      makeKitchenSinkServer(),
      PROXY_TARGET_PORT + 1,
    );
    fooBarServerInstance = await serveOverStreamable(
      makeFooBarServer(),
      PROXY_TARGET_PORT + 2,
    );
  });

  afterAll(async () => {
    await harness.stop();
    await echoServerSSEInstance?.close();
    await kitchenSinkServerInstance?.close();
    await fooBarServerInstance?.close();
  });

  [Transport.SSE, Transport.STREAMABLE].forEach((transport) => {
    beforeEach(async () => {
      await harness.purge();
      proxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [echoServerSSEConfig, kitchenSinkServerConfig],
      });
    });

    describe(`${transport} transport`, () => {
      let proxyClient: HTTPClient;

      beforeEach(async () => {
        proxyClient = await createProxyClient(transport, proxy.id);
      });

      afterEach(async () => {
        await proxyClient.close();
      });

      it("should return 404 when proxy not found", async () => {
        const res = await fetch(getProxyUrl(transport, "not_existing_proxy"));
        expect(res.status).toEqual(404);
        expect(res.ok).toBeFalsy();
      });

      describe("tools", () => {
        it("should be able to list tools", async () => {
          await expectListToolsToReturnToolNames(proxyClient, [
            "echo",
            "ping",
            "add",
            "subtract",
            "multiply",
          ]);
        });

        it("should be able to call a tool", async () => {
          await expectToolCallToHaveResult({
            client: proxyClient,
            toolName: "ping",
            arguments: {},
            expectedResult: { message: "pong" },
          });
        });
      });

      describe("addServer", () => {
        it("should be able to add a server to a proxy", async () => {
          await harness.client.store.addServer.mutate({
            proxyId: proxy.id,
            server: fooBarServerConfig,
          });

          await expectListToolsToReturnToolNames(proxyClient, [
            "echo",
            "ping",
            "add",
            "subtract",
            "multiply",
            "foo",
          ]);

          await expectToolCallToHaveResult({
            client: proxyClient,
            toolName: "foo",
            arguments: {
              message: "bar",
            },
            expectedResult: { message: "bar" },
          });
        });
      });

      describe("removeServer", () => {
        it("should be able to remove a server from a proxy", async () => {
          await harness.client.store.removeServer.mutate({
            proxyId: proxy.id,
            serverName: kitchenSinkServerConfig.name,
          });

          await expectListToolsToReturnToolNames(proxyClient, ["echo"]);
          await expectUnknownToolError({
            client: proxyClient,
            toolName: "ping",
            arguments: {},
          });
        });
      });
    });
  });
});
