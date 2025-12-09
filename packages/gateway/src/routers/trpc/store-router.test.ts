import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { GatewayRouterOutputs } from "../../client";
import { IntegrationTestHarness } from "../../test/integration";

describe("Playbook Router", () => {
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
  });

  describe("get", () => {
    it("should not return in memory targets by default", async () => {
      const ret = await harness.client.store.get.query({
        playbookId: playbook.id,
      });
      expect(ret.servers).toHaveLength(1); // Only echo server, prompt manager is filtered out
      expect(ret.servers).not.toContainEqual(
        expect.objectContaining({ name: "__prompts__" }),
      );
    });
  });
});
