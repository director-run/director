import { HTTPClient } from "@director.run/mcp/client/http-client";
import {
  expectListToolsToReturnToolNames,
  expectToolCallToHaveResult,
  expectUnknownToolError,
} from "@director.run/mcp/test/helpers";
import {
  expectGetPromptToReturn,
  expectListPromptsToReturn,
} from "@director.run/mcp/test/helpers";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { type GatewayRouterOutputs } from "./client";
import { makePrompt } from "./test/fixtures";
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
  let proxy: GatewayRouterOutputs["store"]["create"];

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

        describe("tool prefixing", () => {
          beforeEach(async () => {
            await harness.client.store.updateServer.mutate({
              proxyId: proxy.id,
              serverName: "echo",
              attributes: {
                toolPrefix: "prefix__",
              },
            });
          });

          it("should return prefixed tools in list tools", async () => {
            await expectListToolsToReturnToolNames(proxyClient, [
              "prefix__echo",
              "ping",
              "add",
              "subtract",
              "multiply",
            ]);
          });

          it("should be able to call a tool with a prefix", async () => {
            await expectToolCallToHaveResult({
              client: proxyClient,
              toolName: "prefix__echo",
              arguments: { message: "Hello" },
              expectedResult: { message: "Hello" },
            });
          });

          it("should fail to call the tool without the prefix", async () => {
            await expectUnknownToolError({
              client: proxyClient,
              toolName: "echo",
              arguments: { message: "Hello" },
            });
          });

          it("should be able to remove the prefix", async () => {
            await harness.client.store.updateServer.mutate({
              proxyId: proxy.id,
              serverName: "echo",
              attributes: {
                toolPrefix: "",
              },
            });

            await expectListToolsToReturnToolNames(proxyClient, [
              "echo",
              "ping",
              "add",
              "subtract",
              "multiply",
            ]);
          });
        });

        describe("tool disabling", () => {
          beforeEach(async () => {
            await harness.client.store.updateServer.mutate({
              proxyId: proxy.id,
              serverName: "kitchen-sink",
              attributes: {
                disabledTools: ["ping", "add"],
              },
            });
          });

          it("should not return disabled tools in list tools", async () => {
            await expectListToolsToReturnToolNames(proxyClient, [
              "echo",
              "subtract",
              "multiply",
            ]);
          });

          it("should fail to call a disabled tool", async () => {
            await expectUnknownToolError({
              client: proxyClient,
              toolName: "ping",
              arguments: {},
            });
          });

          it("should be able to re-enable a tool", async () => {
            await harness.client.store.updateServer.mutate({
              proxyId: proxy.id,
              serverName: "kitchen-sink",
              attributes: {
                disabledTools: [],
              },
            });

            await expectListToolsToReturnToolNames(proxyClient, [
              "echo",
              "ping",
              "add",
              "subtract",
              "multiply",
            ]);
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

      describe("disabling targets", () => {
        beforeEach(async () => {
          await harness.client.store.updateServer.mutate({
            proxyId: proxy.id,
            serverName: "kitchen-sink",
            attributes: { disabled: true },
          });
        });

        it("should not return tools in list tools on a disabled target", async () => {
          await expectListToolsToReturnToolNames(proxyClient, ["echo"]);
        });

        it("should fail to call tools on a disabled target", async () => {
          await expectUnknownToolError({
            client: proxyClient,
            toolName: "ping",
            arguments: {},
          });
        });
      });

      describe("prompts", () => {
        const prompt = makePrompt();

        beforeEach(async () => {
          await harness.client.store.addPrompt.mutate({
            proxyId: proxy.id,
            prompt,
          });
        });

        it("should return the prompt", async () => {
          await expectGetPromptToReturn({
            client: proxyClient,
            promptName: prompt.name,
            expectedBody: prompt.body,
          });
        });

        it("should be able to list prompts", async () => {
          await expectListPromptsToReturn({
            client: proxyClient,
            expectedPrompts: [
              {
                name: prompt.name,
                title: prompt.title,
                description: prompt.description,
              },
            ],
          });
        });

        it("should be able to update a prompt", async () => {
          await harness.client.store.updatePrompt.mutate({
            proxyId: proxy.id,
            promptName: prompt.name,
            prompt: {
              title: "Updated Title",
              description: "Updated description",
              body: "Updated body",
            },
          });

          await expectGetPromptToReturn({
            client: proxyClient,
            promptName: prompt.name,
            expectedBody: "Updated body",
          });

          await expectListPromptsToReturn({
            client: proxyClient,
            expectedPrompts: [
              {
                name: prompt.name,
                title: "Updated Title",
                description: "Updated description",
              },
            ],
          });
        });

        it("should be able to remove a prompt", async () => {
          await harness.client.store.removePrompt.mutate({
            proxyId: proxy.id,
            promptName: prompt.name,
          });
          await expectListPromptsToReturn({
            client: proxyClient,
            expectedPrompts: [],
          });
        });
      });
    });
  });
});
