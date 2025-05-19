import { afterAll, beforeAll, describe, test } from "vitest";
import { IntegrationTestHarness } from "../../test/integration";

describe("Store Router", () => {
  let harness: IntegrationTestHarness;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  describe("addServerFromRegistry", () => {
    test.todo(
      "should add the registry: prefix to the server name",
      async () => {
        // TODO: how do we mock the registry TRPC client in tests?
      },
    );
  });
});
