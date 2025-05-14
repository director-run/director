import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { env } from "./config";
import { db } from "./db";
import { entriesTable } from "./db/schema";
import { startServer } from "./server";
import { createTestEntries } from "./test/fixtures/entries";

describe("HTTP Server", () => {
  const baseUrl = `http://localhost:${env.REGISTRY_PORT}/api/v1`;
  const TOTAL_ENTRIES = 20;
  const ENTRIES_PER_PAGE = 5;

  beforeAll(async () => {
    // Purge existing data
    await db.delete(entriesTable);

    // Create test entries
    const entries = createTestEntries(TOTAL_ENTRIES);

    await db.insert(entriesTable).values(entries);

    // Start server
    await startServer({ port: env.REGISTRY_PORT });
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(entriesTable);
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

  //   it("should handle default pagination parameters", async () => {
  //     const response = await fetch(`${baseUrl}/entries`);
  //     const data = await response.json();

  //     expect(data.pagination).toEqual({
  //       page: 1,
  //       limit: 20, // Default limit
  //       totalItems: TOTAL_ENTRIES,
  //       totalPages: Math.ceil(TOTAL_ENTRIES / 20),
  //       hasNextPage: false,
  //       hasPreviousPage: false,
  //     });
  //   });

  //   it("should handle invalid pagination parameters", async () => {
  //     const response = await fetch(`${baseUrl}/entries?page=0&limit=0`);
  //     expect(response.status).toBe(400);
  //   });
});
