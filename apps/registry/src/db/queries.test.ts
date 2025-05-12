import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { db } from ".";
import { createTestEntry } from "../test/fixtures/entries";
import { createTestEntries } from "../test/fixtures/entries";
import {
  addEntries,
  addEntry,
  countEntries,
  deleteAllEntries,
  getEntryByName,
} from "./queries";
import { entriesTable } from "./schema";

describe("queries", () => {
  describe("getEntryByName", () => {
    beforeAll(async () => {
      await db.insert(entriesTable).values(
        createTestEntry({
          name: "test-server",
          title: "Test Server",
          description: "A test server",
        }),
      );
    });

    afterAll(async () => {
      await deleteAllEntries();
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

  describe("addEntry", () => {
    afterAll(async () => {
      await deleteAllEntries();
    });
    it("should add a single entry", async () => {
      const entry = createTestEntry();
      await addEntry(entry);
      const result = await getEntryByName(entry.name);
      expect(result).toBeDefined();
      expect(result.name).toBe(entry.name);
    });
  });

  describe("addEntries", () => {
    afterEach(async () => {
      await deleteAllEntries();
    });

    it("should insert all entries when ignoreDuplicates is false", async () => {
      const entries = createTestEntries(3);
      await addEntries(entries);
      expect(await countEntries()).toEqual(3);
    });

    it("should skip duplicates when ignoreDuplicates is true", async () => {
      // First insert
      const entries1 = createTestEntries(2);
      await addEntries(entries1);

      // Second insert with one duplicate
      const entries2 = [
        entries1[0], // This is a duplicate
        createTestEntries(1)[0], // This is new
      ];
      await addEntries(entries2, { ignoreDuplicates: true });

      const result = await db.select().from(entriesTable);
      expect(result).toHaveLength(3); // 2 from first insert + 1 new from second insert
    });

    it("should not insert anything when all entries are duplicates", async () => {
      const entries = createTestEntries(2);
      await addEntries(entries);

      // Try to insert the same entries again
      await addEntries(entries, { ignoreDuplicates: true });

      const result = await db.select().from(entriesTable);
      expect(result).toHaveLength(2); // Should still only have the original entries
    });
  });
});
