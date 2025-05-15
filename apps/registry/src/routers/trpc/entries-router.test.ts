import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { env } from "../../config";
import { Registry } from "../../registry";
import { createTestEntries } from "../../test/fixtures/entries";

describe("Entries Router", () => {
  let registry: Registry;

  beforeAll(async () => {
    registry = await Registry.start({ port: env.REGISTRY_PORT });
  });

  afterAll(async () => {
    await registry.stop();
  });

  beforeEach(async () => {
    await registry.store.purge();
  });

  describe("getEntries", () => {
    it("should handle pagination correctly", async () => {
      const totalEntries = 100;
      await registry.store.entries.addEntries(createTestEntries(totalEntries));
    });
  });
});
