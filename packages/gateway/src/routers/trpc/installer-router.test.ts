import { afterAll, beforeAll, describe, it } from "vitest";
import { IntegrationTestHarness } from "../../test/integration";

describe("Installer Router", () => {
  let harness: IntegrationTestHarness;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  describe("byProxy", () => {
    it("should get all proxies", async () => {
      await harness.purge();
      await harness.client.store.create.mutate({
        name: "Test proxy",
      });
    });
  });
});
