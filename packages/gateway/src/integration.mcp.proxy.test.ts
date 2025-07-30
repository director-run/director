import { HTTPClient } from "@director.run/mcp/client/http-client";
import {
  expectListToolsToReturnToolNames,
  expectToolCallToHaveResult,
  expectUnknownToolError,
} from "@director.run/mcp/test/helpers";
import {} from "@director.run/mcp/transport";
import type { ProxyServerAttributes } from "@director.run/utilities/schema";
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

describe("MCP Proxy", () => {
  let harness: IntegrationTestHarness;
  let proxy: ProxyServerAttributes;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  [Transport.SSE, Transport.STREAMABLE].forEach((transport) => {
    beforeEach(async () => {
      await harness.purge();
      proxy = await harness.client.store.create.mutate({
        name: "Test Proxy",
        servers: [
          harness.getConfigForTarget("echo"),
          harness.getConfigForTarget("kitchenSink"),
        ],
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
            server: harness.getConfigForTarget("foobar"),
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
            serverName: harness.getConfigForTarget("kitchenSink").name,
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
