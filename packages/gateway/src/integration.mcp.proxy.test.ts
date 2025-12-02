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

function getPlaybookUrl(transport: Transport, playbookId: string) {
  return `http://localhost:${IntegrationTestHarness.gatewayPort}/playbooks/${playbookId}/${transport === Transport.SSE ? "sse" : "mcp"}`;
}

async function createPlaybookClient(
  transport: Transport,
  playbookId: string,
  apiKey: string,
) {
  return await HTTPClient.createAndConnectToHTTP(
    getPlaybookUrl(transport, playbookId),
    { Authorization: `Bearer ${apiKey}` },
  );
}

describe("MCP Playbook", () => {
  let harness: IntegrationTestHarness;
  let playbook: GatewayRouterOutputs["store"]["create"];

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
    await harness.register({
      email: "test@example.com",
      password: "password123",
    });
  });

  afterAll(async () => {
    await harness.stop();
  });

  [Transport.SSE, Transport.STREAMABLE].forEach((transport) => {
    beforeEach(async () => {
      await harness.initializeDatabase(true);
      playbook = await harness.client.store.create.mutate({
        name: "Test Playbook",
        servers: [
          harness.getConfigForTarget("echo"),
          harness.getConfigForTarget("kitchenSink"),
        ],
      });
    });

    describe(`${transport} transport`, () => {
      let playbookClient: HTTPClient;

      beforeEach(async () => {
        playbookClient = await createPlaybookClient(
          transport,
          playbook.id,
          harness.getApiKey(),
        );
      });

      afterEach(async () => {
        await playbookClient.close();
      });

      it("should return 401 when no API key provided", async () => {
        const res = await fetch(
          getPlaybookUrl(transport, "not_existing_playbook"),
        );
        expect(res.status).toEqual(401);
        expect(res.ok).toBeFalsy();
      });

      it("should return 404 when playbook not found", async () => {
        const res = await fetch(
          getPlaybookUrl(transport, "not_existing_playbook"),
          {
            headers: {
              Authorization: `Bearer ${harness.getApiKey()}`,
            },
          },
        );
        // Returns 404 because the playbook doesn't exist
        expect(res.status).toEqual(404);
        expect(res.ok).toBeFalsy();
      });

      describe("tools", () => {
        it("should be able to list tools", async () => {
          await expectListToolsToReturnToolNames(playbookClient, [
            "echo",
            "ping",
            "add",
            "subtract",
            "multiply",
          ]);
        });

        it("should be able to call a tool", async () => {
          await expectToolCallToHaveResult({
            client: playbookClient,
            toolName: "ping",
            arguments: {},
            expectedResult: { message: "pong" },
          });
        });

        describe("tool prefixing", () => {
          beforeEach(async () => {
            await harness.client.store.updateServer.mutate({
              playbookId: playbook.id,
              serverName: "echo",
              attributes: {
                tools: { prefix: "prefix__" },
              },
            });
          });

          it("should return prefixed tools in list tools", async () => {
            await expectListToolsToReturnToolNames(playbookClient, [
              "prefix__echo",
              "ping",
              "add",
              "subtract",
              "multiply",
            ]);
          });

          it("should be able to call a tool with a prefix", async () => {
            await expectToolCallToHaveResult({
              client: playbookClient,
              toolName: "prefix__echo",
              arguments: { message: "Hello" },
              expectedResult: { message: "Hello" },
            });
          });

          it("should fail to call the tool without the prefix", async () => {
            await expectUnknownToolError({
              client: playbookClient,
              toolName: "echo",
              arguments: { message: "Hello" },
            });
          });

          it("should be able to remove the prefix", async () => {
            await harness.client.store.updateServer.mutate({
              playbookId: playbook.id,
              serverName: "echo",
              attributes: {
                tools: { prefix: "" },
              },
            });

            await expectListToolsToReturnToolNames(playbookClient, [
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
              playbookId: playbook.id,
              serverName: "kitchen-sink",
              attributes: {
                tools: { exclude: ["ping", "add"] },
              },
            });
          });

          it("should not return disabled tools in list tools", async () => {
            await expectListToolsToReturnToolNames(playbookClient, [
              "echo",
              "subtract",
              "multiply",
            ]);
          });

          it("should fail to call a disabled tool", async () => {
            await expectUnknownToolError({
              client: playbookClient,
              toolName: "ping",
              arguments: {},
            });
          });

          it("should be able to re-enable a tool", async () => {
            await harness.client.store.updateServer.mutate({
              playbookId: playbook.id,
              serverName: "kitchen-sink",
              attributes: {
                tools: { exclude: [] },
              },
            });

            await expectListToolsToReturnToolNames(playbookClient, [
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
        it("should be able to add a server to a playbook", async () => {
          await harness.client.store.addServer.mutate({
            playbookId: playbook.id,
            server: harness.getConfigForTarget("foobar"),
          });

          await expectListToolsToReturnToolNames(playbookClient, [
            "echo",
            "ping",
            "add",
            "subtract",
            "multiply",
            "foo",
          ]);

          await expectToolCallToHaveResult({
            client: playbookClient,
            toolName: "foo",
            arguments: {
              message: "bar",
            },
            expectedResult: { message: "bar" },
          });
        });
      });

      describe("removeServer", () => {
        it("should be able to remove a server from a playbook", async () => {
          await harness.client.store.removeServer.mutate({
            playbookId: playbook.id,
            serverName: harness.getConfigForTarget("kitchenSink").name,
          });

          await expectListToolsToReturnToolNames(playbookClient, ["echo"]);
          await expectUnknownToolError({
            client: playbookClient,
            toolName: "ping",
            arguments: {},
          });
        });
      });

      describe("disabling targets", () => {
        beforeEach(async () => {
          await harness.client.store.updateServer.mutate({
            playbookId: playbook.id,
            serverName: "kitchen-sink",
            attributes: { disabled: true },
          });
        });

        it("should not return tools in list tools on a disabled target", async () => {
          await expectListToolsToReturnToolNames(playbookClient, ["echo"]);
        });

        it("should fail to call tools on a disabled target", async () => {
          await expectUnknownToolError({
            client: playbookClient,
            toolName: "ping",
            arguments: {},
          });
        });
      });

      describe("prompts", () => {
        const prompt = makePrompt();

        beforeEach(async () => {
          await harness.client.store.addPrompt.mutate({
            playbookId: playbook.id,
            prompt,
          });
        });

        it("should return the prompt", async () => {
          await expectGetPromptToReturn({
            client: playbookClient,
            promptName: prompt.name,
            expectedBody: prompt.body,
          });
        });

        it("should be able to list prompts", async () => {
          await expectListPromptsToReturn({
            client: playbookClient,
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
            playbookId: playbook.id,
            promptName: prompt.name,
            prompt: {
              title: "Updated Title",
              description: "Updated description",
              body: "Updated body",
            },
          });

          await expectGetPromptToReturn({
            client: playbookClient,
            promptName: prompt.name,
            expectedBody: "Updated body",
          });

          await expectListPromptsToReturn({
            client: playbookClient,
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
            playbookId: playbook.id,
            promptName: prompt.name,
          });
          await expectListPromptsToReturn({
            client: playbookClient,
            expectedPrompts: [],
          });
        });
      });
    });
  });
});
