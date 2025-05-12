import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { db } from ".";
import { createTestEntry } from "../test/fixtures/entries";
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
    it("should add multiple entries", async () => {
      const entries = [createTestEntry(), createTestEntry()];
      await addEntries(entries);
      const result = await getEntryByName(entries[0].name);
      expect(result).toBeDefined();
      expect(result.name).toBe(entries[0].name);
    });
    it("should throw an error if one of the entries already exists", async () => {
      const entries = [createTestEntry(), createTestEntry(), createTestEntry()];
      await addEntry(entries[0]);
      await expect(addEntries(entries)).rejects.toThrow(
        'duplicate key value violates unique constraint "entries_name_unique"',
      );
      expect(await countEntries()).toBe(1);
    });
  });
});
