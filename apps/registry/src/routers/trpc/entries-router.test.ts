import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { type RegistryClient, createRegistryClient } from "../../client";
import { env } from "../../config";
import { Registry } from "../../registry";
import { makeTestEntries } from "../../test/fixtures/entries";

describe("Entries Router", () => {
  let registry: Registry;
  let client: RegistryClient;
  const TOTAL_ENTRIES = 20;
  const ENTRIES_PER_PAGE = 5;

  beforeAll(async () => {
    registry = await Registry.start({
      port: env.PORT,
      connectionString: env.DATABASE_URL,
    });
    client = createRegistryClient(`http://localhost:${env.PORT}`);
    await registry.store.purge();
  });

  afterAll(async () => {
    await registry.stop();
  });

  beforeEach(async () => {
    await registry.store.purge();
    await registry.store.entries.addEntries(makeTestEntries(TOTAL_ENTRIES));
  });

  describe("getEntries", () => {
    it("should handle pagination correctly", async () => {
      // Test first page
      const result1 = await client.entries.getEntries.query({
        pageIndex: 0,
        pageSize: ENTRIES_PER_PAGE,
      });
      expect(result1.entries).toHaveLength(ENTRIES_PER_PAGE);
      expect(result1.pagination).toEqual({
        pageIndex: 0,
        pageSize: ENTRIES_PER_PAGE,
        totalItems: TOTAL_ENTRIES,
        totalPages: Math.ceil(TOTAL_ENTRIES / ENTRIES_PER_PAGE),
        hasNextPage: true,
        hasPreviousPage: false,
      });

      // Test middle page
      const result2 = await client.entries.getEntries.query({
        pageIndex: 1,
        pageSize: ENTRIES_PER_PAGE,
      });
      expect(result2.entries).toHaveLength(ENTRIES_PER_PAGE);
      expect(result2.pagination).toEqual({
        pageIndex: 1,
        pageSize: ENTRIES_PER_PAGE,
        totalItems: TOTAL_ENTRIES,
        totalPages: Math.ceil(TOTAL_ENTRIES / ENTRIES_PER_PAGE),
        hasNextPage: true,
        hasPreviousPage: true,
      });

      // Test last page
      const result3 = await client.entries.getEntries.query({
        pageIndex: 3,
        pageSize: ENTRIES_PER_PAGE,
      });
      expect(result3.entries).toHaveLength(ENTRIES_PER_PAGE);
      expect(result3.pagination).toEqual({
        pageIndex: 3,
        pageSize: ENTRIES_PER_PAGE,
        totalItems: TOTAL_ENTRIES,
        totalPages: Math.ceil(TOTAL_ENTRIES / ENTRIES_PER_PAGE),
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });
  });
});
