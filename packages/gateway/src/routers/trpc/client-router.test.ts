import { afterAll, beforeAll, describe, it } from "vitest";
import { IntegrationTestHarness } from "../../test/integration";

describe("Client Router", () => {
  let harness: IntegrationTestHarness;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  describe("byProxy", () => {
    it.skip("should work", async () => {});
  });
});
