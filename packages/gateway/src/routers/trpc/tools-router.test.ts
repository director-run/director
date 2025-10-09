import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { GatewayRouterOutputs } from "../../client";
import { IntegrationTestHarness } from "../../test/integration";

describe("Tools Router", () => {
  let harness: IntegrationTestHarness;
  let workspace: GatewayRouterOutputs["store"]["create"];

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  beforeEach(async () => {
    await harness.purge();
    workspace = await harness.client.store.create.mutate({
      name: "Test Workspace",
      servers: [
        harness.getConfigForTarget("echo"),
        harness.getConfigForTarget("kitchenSink"),
      ],
    });
  });

  describe("listTools", () => {
    it("should list tools", async () => {
      const result = await harness.client.tools.list.query({
        workspaceId: workspace.id,
      });
      expect(result.map((t) => t.name)).toEqual([
        "echo",
        "ping",
        "add",
        "subtract",
        "multiply",
      ]);
    });
  });

  describe("callTool", () => {
    it("should call a tool", async () => {
      const result = (await harness.client.tools.callTool.mutate({
        workspaceId: workspace.id,
        serverName: "echo",
        toolName: "echo",
        arguments: {
          message: "hello",
        },
      })) as CallToolResult;

      expect(JSON.parse(result?.content?.[0]?.text as string)).toEqual({
        message: "hello",
      });
    });
  });
});
