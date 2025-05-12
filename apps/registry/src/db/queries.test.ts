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
      const entries = createTestEntries(3);
      await addEntry(entries[0]);
      await addEntries(entries, { ignoreDuplicates: true });
      expect(await countEntries()).toEqual(3);
    });

    it("should not insert anything when all entries are duplicates", async () => {
      const entries = createTestEntries(3);
      await addEntry(entries[0]);
      await expect(
        addEntries(entries, { ignoreDuplicates: false }),
      ).rejects.toThrow();
      expect(await countEntries()).toEqual(1);
    });
  });
});
