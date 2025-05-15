import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { type RegistryClient, createRegistryClient } from "../../client";
import { env } from "../../config";
import { Registry } from "../../registry";
import { makeTestEntries } from "../../test/fixtures/entries";

describe("Entries Router", () => {
  let registry: Registry;
  let client: RegistryClient;

  beforeAll(async () => {
    registry = await Registry.start({ port: env.REGISTRY_PORT });
    client = createRegistryClient(env.REGISTRY_URL);
    await registry.store.purge();
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
      await registry.store.entries.addEntries(makeTestEntries(totalEntries));
      const result = await client.entries.getEntries.query({
        page: 1,
        limit: 10,
      });
      expect(result.entries.length).toBe(10);
      expect(result.total).toBe(totalEntries);
    });
  });
});
