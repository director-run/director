import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { GatewayRouterOutputs } from "../../client";
import { IntegrationTestHarness } from "../../test/integration";

describe("Installer Router", () => {
  let harness: IntegrationTestHarness;
  let proxy: GatewayRouterOutputs["store"]["create"];

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  beforeEach(async () => {
    await harness.purge();
    proxy = await harness.client.store.create.mutate({
      name: "Test Proxy",
      servers: [harness.getConfigForTarget("echo")],
    });
  });

  describe("get", () => {
    it("should not return in memory targets by default", async () => {
      const ret = await harness.client.store.get.query({
        proxyId: proxy.id,
      });
      expect(ret.servers).toHaveLength(1); // Only echo server, prompt manager is filtered out
      expect(ret.servers).not.toContainEqual(
        expect.objectContaining({ name: "__prompts__" }),
      );
    });
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
