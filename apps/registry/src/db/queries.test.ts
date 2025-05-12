import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from ".";
import { createTestEntry } from "../test/fixtures/entries";
import { getEntryByName, purgeDatabase } from "./queries";
import { entriesTable } from "./schema";

describe("getEntryByName", () => {
  beforeAll(async () => {
    // Insert test data
    await db.insert(entriesTable).values(createTestEntry());
  });

  afterAll(async () => {
    // Clean up test data
    await purgeDatabase();
  });

  it("should return the correct entry when it exists", async () => {
    const entry = await getEntryByName("test-server");
    expect(entry).toBeDefined();
    expect(entry.name).toBe("test-server");
    expect(entry.title).toBe("Test Server");
    expect(entry.description).toBe("A test server");
    expect(entry.isOfficial).toBe(false);
  });

  it("should throw an error when entry does not exist", async () => {
    await expect(getEntryByName("non-existent-server")).rejects.toThrow(
      "No entry found with name: non-existent-server",
    );
  });
});
