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
});
