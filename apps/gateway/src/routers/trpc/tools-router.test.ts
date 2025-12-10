import {
  type CallToolResult,
  type TextContent,
} from "@modelcontextprotocol/sdk/types.js";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { GatewayRouterOutputs } from "../../client";
import { IntegrationTestHarness } from "../../test/integration";

describe("Tools Router", () => {
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

  beforeEach(async () => {
    await harness.initializeDatabase(true);
    playbook = await harness.client.store.create.mutate({
      name: "Test Playbook",
    });
    const echoConfig = harness.getConfigForTarget("echo");
    await harness.client.store.addHTTPServer.mutate({
      playbookId: playbook.id,
      name: echoConfig.name,
      url: echoConfig.transport.url,
    });
    const kitchenSinkConfig = harness.getConfigForTarget("kitchenSink");
    await harness.client.store.addHTTPServer.mutate({
      playbookId: playbook.id,
      name: kitchenSinkConfig.name,
      url: kitchenSinkConfig.transport.url,
    });
  });

  describe("listTools", () => {
    it("should list tools", async () => {
      const toolsResult = await harness.client.tools.list.query({
        playbookId: playbook.id,
      });
      expect(toolsResult.map((t) => t.name)).toEqual([
        "add",
        "echo",
        "multiply",
        "ping",
        "subtract",
      ]);
    });

    it("should return only return tools for the given server name", async () => {
      const toolsResult = await harness.client.tools.list.query({
        playbookId: playbook.id,
        serverName: "echo",
      });
      expect(toolsResult.map((t) => t.name)).toEqual(["echo"]);
    });

    it("should correctly mark disabled tools as disabled", async () => {
      await harness.client.tools.updateBatch.mutate({
        playbookId: playbook.id,
        tools: [
          {
            serverName: "echo",
            name: "echo",
            disabled: true,
          },
        ],
      });

      const toolsResult = await harness.client.tools.list.query({
        playbookId: playbook.id,
        serverName: "echo",
      });
      expect(toolsResult.map((t) => t.name)).toEqual(["echo"]);
      expect(toolsResult.find((t) => t.name === "echo")?.disabled).toBe(true);
    });
  });

  describe("updateBatch", () => {
    it("should update tools", async () => {
      await harness.client.tools.updateBatch.mutate({
        playbookId: playbook.id,
        tools: [
          {
            serverName: "echo",
            name: "echo",
            disabled: true,
          },
        ],
      });

      const toolsResult = await harness.client.tools.list.query({
        playbookId: playbook.id,
      });

      expect(toolsResult.map((t) => t.name)).toEqual([
        "add",
        "echo",
        "multiply",
        "ping",
        "subtract",
      ]);

      expect(toolsResult.find((t) => t.name === "echo")?.disabled).toBe(true);
    });
  });

  describe("callTool", () => {
    it("should call a tool", async () => {
      const result = (await harness.client.tools.callTool.mutate({
        playbookId: playbook.id,
        serverName: "echo",
        toolName: "echo",
        arguments: {
          message: "hello",
        },
      })) as CallToolResult;

      const content = result?.content?.[0];
      const text =
        content && content.type === "text"
          ? (content as TextContent).text
          : undefined;
      expect(JSON.parse(text as string)).toEqual({
        message: "hello",
      });
    });
  });
});
