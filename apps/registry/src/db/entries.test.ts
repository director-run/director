import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { createTestEntry } from "../test/fixtures/entries";
import { createTestEntries } from "../test/fixtures/entries";
import { makeStore } from "./store";

describe("queries", () => {
  const store = makeStore();

  describe("getEntryByName", () => {
    beforeAll(async () => {
      await store.entries.addEntry(
        createTestEntry({
          name: "test-server",
          title: "Test Server",
          description: "A test server",
        }),
      );
    });

    afterAll(async () => {
      await store.entries.deleteAllEntries();
    });

    it("should return the correct entry when it exists", async () => {
      const entry = await store.entries.getEntryByName("test-server");
      expect(entry).toBeDefined();
      expect(entry.name).toBe("test-server");
      expect(entry.title).toBe("Test Server");
      expect(entry.description).toBe("A test server");
      expect(entry.isOfficial).toBe(false);
    });

    it("should throw an error when entry does not exist", async () => {
      await expect(
        store.entries.getEntryByName("non-existent-server"),
      ).rejects.toThrow("No entry found with name: non-existent-server");
    });
  });

  describe("addEntry", () => {
    afterAll(async () => {
      await store.entries.deleteAllEntries();
    });
    it("should add a single entry", async () => {
      const entry = createTestEntry();
      await store.entries.addEntry(entry);
      const result = await store.entries.getEntryByName(entry.name);
      expect(result).toBeDefined();
      expect(result.name).toBe(entry.name);
    });
  });

  describe("addEntries", () => {
    afterEach(async () => {
      await store.entries.deleteAllEntries();
    });

    it("should insert all entries when ignoreDuplicates is false", async () => {
      const entries = createTestEntries(3);
      await store.entries.addEntries(entries);
      expect(await store.entries.countEntries()).toEqual(3);
    });

    it("should skip duplicates when ignoreDuplicates is true", async () => {
      const entries = createTestEntries(3);
      await store.entries.addEntry(entries[0]);
      await store.entries.addEntries(entries, { ignoreDuplicates: true });
      expect(await store.entries.countEntries()).toEqual(3);
    });

    it("should not insert anything when all entries are duplicates", async () => {
      const entries = createTestEntries(3);
      await store.entries.addEntry(entries[0]);
      await expect(
        store.entries.addEntries(entries, { ignoreDuplicates: false }),
      ).rejects.toThrow();
      expect(await store.entries.countEntries()).toEqual(1);
    });
  });
});
