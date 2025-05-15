import { beforeAll, describe, expect, it } from "vitest";
import { env } from "./config";
import { Registry } from "./registry";
import { createTestEntries } from "./test/fixtures/entries";

describe("HTTP Server", () => {
  const baseUrl = `http://localhost:${env.REGISTRY_PORT}/api/v1`;
  const TOTAL_ENTRIES = 20;
  const ENTRIES_PER_PAGE = 5;
  let registry: Registry;

  beforeAll(async () => {
    // Purge existing data
    registry = await Registry.start({ port: env.REGISTRY_PORT });
    await registry.store.purge();
    await registry.store.entries.addEntries(createTestEntries(TOTAL_ENTRIES));
  });

  it("should handle pagination correctly", async () => {
    const response1 = await fetch(
      `${baseUrl}/entries?page=1&limit=${ENTRIES_PER_PAGE}`,
    );
    const data1 = await response1.json();

    expect(data1.data).toHaveLength(ENTRIES_PER_PAGE);
    expect(data1.pagination).toEqual({
      page: 1,
      limit: ENTRIES_PER_PAGE,
      totalItems: TOTAL_ENTRIES,
      totalPages: Math.ceil(TOTAL_ENTRIES / ENTRIES_PER_PAGE),
      hasNextPage: true,
      hasPreviousPage: false,
    });

    // Test middle page
    const response2 = await fetch(
      `${baseUrl}/entries?page=2&limit=${ENTRIES_PER_PAGE}`,
    );
    const data2 = await response2.json();

    expect(data2.data).toHaveLength(ENTRIES_PER_PAGE);
    expect(data2.pagination).toEqual({
      page: 2,
      limit: ENTRIES_PER_PAGE,
      totalItems: TOTAL_ENTRIES,
      totalPages: Math.ceil(TOTAL_ENTRIES / ENTRIES_PER_PAGE),
      hasNextPage: true,
      hasPreviousPage: true,
    });

    // Test last page
    const response3 = await fetch(
      `${baseUrl}/entries?page=4&limit=${ENTRIES_PER_PAGE}`,
    );
    const data3 = await response3.json();

    expect(data3.data).toHaveLength(ENTRIES_PER_PAGE);
    expect(data3.pagination).toEqual({
      page: 4,
      limit: ENTRIES_PER_PAGE,
      totalItems: TOTAL_ENTRIES,
      totalPages: Math.ceil(TOTAL_ENTRIES / ENTRIES_PER_PAGE),
      hasNextPage: false,
      hasPreviousPage: true,
    });
  });
});
