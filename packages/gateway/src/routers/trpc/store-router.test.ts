import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { GatewayRouterOutputs } from "../../client";
import { IntegrationTestHarness } from "../../test/integration";

describe("Installer Router", () => {
  let harness: IntegrationTestHarness;
  let proxy: GatewayRouterOutputs["store"]["create"];

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
    proxy = await harness.client.store.create.mutate({
      name: "Test Proxy",
      servers: [harness.getConfigForTarget("echo")],
    });
  });

  afterAll(async () => {
    await harness.stop();
  });

  describe("callTool", () => {
    it("should call a tool", async () => {
      const result = (await harness.client.store.callTool.mutate({
        proxyId: proxy.id,
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
