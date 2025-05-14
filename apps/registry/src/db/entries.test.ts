import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { DatabaseConnection } from ".";
import { env } from "../config";
import { createTestEntry } from "../test/fixtures/entries";
import { createTestEntries } from "../test/fixtures/entries";
import { EntryStore } from "./entries";
import { entriesTable } from "./schema";

describe("queries", () => {
  const db = DatabaseConnection.create(env.DATABASE_URL);
  const entryStore = EntryStore.create(db);

  describe("getEntryByName", () => {
    beforeAll(async () => {
      await db.db.insert(entriesTable).values(
        createTestEntry({
          name: "test-server",
          title: "Test Server",
          description: "A test server",
        }),
      );
    });

    afterAll(async () => {
      await entryStore.deleteAllEntries();
    });

    it("should return the correct entry when it exists", async () => {
      const entry = await entryStore.getEntryByName("test-server");
      expect(entry).toBeDefined();
      expect(entry.name).toBe("test-server");
      expect(entry.title).toBe("Test Server");
      expect(entry.description).toBe("A test server");
      expect(entry.isOfficial).toBe(false);
    });

    it("should throw an error when entry does not exist", async () => {
      await expect(
        entryStore.getEntryByName("non-existent-server"),
      ).rejects.toThrow("No entry found with name: non-existent-server");
    });
  });

  describe("addEntry", () => {
    afterAll(async () => {
      await entryStore.deleteAllEntries();
    });
    it("should add a single entry", async () => {
      const entry = createTestEntry();
      await entryStore.addEntry(entry);
      const result = await entryStore.getEntryByName(entry.name);
      expect(result).toBeDefined();
      expect(result.name).toBe(entry.name);
    });
  });

  describe("addEntries", () => {
    afterEach(async () => {
      await entryStore.deleteAllEntries();
    });

    it("should insert all entries when ignoreDuplicates is false", async () => {
      const entries = createTestEntries(3);
      await entryStore.addEntries(entries);
      expect(await entryStore.countEntries()).toEqual(3);
    });

    it("should skip duplicates when ignoreDuplicates is true", async () => {
      const entries = createTestEntries(3);
      await entryStore.addEntry(entries[0]);
      await entryStore.addEntries(entries, { ignoreDuplicates: true });
      expect(await entryStore.countEntries()).toEqual(3);
    });

    it("should not insert anything when all entries are duplicates", async () => {
      const entries = createTestEntries(3);
      await entryStore.addEntry(entries[0]);
      await expect(
        entryStore.addEntries(entries, { ignoreDuplicates: false }),
      ).rejects.toThrow();
      expect(await entryStore.countEntries()).toEqual(1);
    });
  });
});
