import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { env } from "../config";
import { makeTestEntry } from "../test/fixtures/entries";
import { makeTestEntries } from "../test/fixtures/entries";
import { createStore } from "./store";

describe("queries", () => {
  const store = createStore({ connectionString: env.DATABASE_URL });

  describe("getEntryByName", () => {
    beforeAll(async () => {
      await store.entries.addEntry(
        makeTestEntry({
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
      const entry = makeTestEntry();
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

    it("should add entries with a default state of draft", async () => {
      const entries = makeTestEntries(3);
      await store.entries.addEntries(entries);
      expect(await store.entries.countEntries()).toEqual(3);
      const allEntries = await store.entries.getAllEntries();
      expect(allEntries.every((e) => e.state === "draft")).toBe(true);
    });

    it("should add entries with a custom state", async () => {
      const entries = makeTestEntries(3);
      await store.entries.addEntries(entries, { state: "published" });
      expect(await store.entries.countEntries()).toEqual(3);
      const allEntries = await store.entries.getAllEntries();
      expect(allEntries.every((e) => e.state === "published")).toBe(true);
    });

    it("should insert all entries when ignoreDuplicates is false", async () => {
      const entries = makeTestEntries(3);
      await store.entries.addEntries(entries);
      expect(await store.entries.countEntries()).toEqual(3);
    });

    it("should skip duplicates when ignoreDuplicates is true", async () => {
      const entries = makeTestEntries(3);
      await store.entries.addEntry(entries[0]);
      await store.entries.addEntries(entries, { ignoreDuplicates: true });
      expect(await store.entries.countEntries()).toEqual(3);
    });

    it("should not insert anything when all entries are duplicates", async () => {
      const entries = makeTestEntries(3);
      await store.entries.addEntry(entries[0]);
      await expect(
        store.entries.addEntries(entries, { ignoreDuplicates: false }),
      ).rejects.toThrow();
      expect(await store.entries.countEntries()).toEqual(1);
    });
  });

  describe("deleteEntry", () => {
    afterEach(async () => {
      await store.entries.deleteAllEntries();
    });

    it("should delete an entry by id", async () => {
      const entry = makeTestEntry();
      await store.entries.addEntry(entry);
      const addedEntry = await store.entries.getEntryByName(entry.name);

      await store.entries.deleteEntry(addedEntry.id);

      await expect(store.entries.getEntryByName(entry.name)).rejects.toThrow(
        `No entry found with name: ${entry.name}`,
      );
    });
  });

  describe("updateEntry", () => {
    afterEach(async () => {
      await store.entries.deleteAllEntries();
    });

    it("should update an entry's fields", async () => {
      const entry = makeTestEntry();
      await store.entries.addEntry(entry);
      const addedEntry = await store.entries.getEntryByName(entry.name);

      await store.entries.updateEntry(addedEntry.id, {
        title: "new",
      });

      const updatedEntry = await store.entries.getEntryByName(entry.name);
      expect(updatedEntry.title).toBe("new");
    });
  });

  describe("getIconsAndDescriptionsForEntries", () => {
    afterEach(async () => {
      await store.entries.deleteAllEntries();
    });

    it("should return icons and descriptions for existing entries", async () => {
      const entries = [
        makeTestEntry({
          name: "test-server-1",
          description: "Test server 1",
          icon: "test-icon-1.svg",
        }),
        makeTestEntry({
          name: "test-server-2",
          description: "Test server 2",
          icon: "test-icon-2.svg",
        }),
        makeTestEntry({
          name: "test-server-3",
          description: "Test server 3",
          icon: "test-icon-3.svg",
        }),
      ];
      await store.entries.addEntries(entries, { ignoreDuplicates: false });

      const result = await store.entries.getIconsAndDescriptionsForEntries([
        "test-server-1",
        "test-server-2",
        "test-server-3",
      ]);

      expect(result).toHaveLength(3);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "test-server-1",
            description: "Test server 1",
            icon: "test-icon-1.svg",
          }),
          expect.objectContaining({
            name: "test-server-2",
            description: "Test server 2",
            icon: "test-icon-2.svg",
          }),
          expect.objectContaining({
            name: "test-server-3",
            description: "Test server 3",
            icon: "test-icon-3.svg",
          }),
        ]),
      );
    });

    it("should return only existing entries when some names don't exist", async () => {
      const entries = [
        makeTestEntry({
          name: "existing-server",
          description: "Existing server",
          icon: "existing-icon.svg",
        }),
      ];
      await store.entries.addEntries(entries, { ignoreDuplicates: false });

      const result = await store.entries.getIconsAndDescriptionsForEntries([
        "existing-server",
        "non-existent-server",
      ]);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: "existing-server",
        description: "Existing server",
        icon: "existing-icon.svg",
      });
    });

    it("should return empty array when no entries exist", async () => {
      const result = await store.entries.getIconsAndDescriptionsForEntries([
        "non-existent-server-1",
        "non-existent-server-2",
      ]);

      expect(result).toHaveLength(0);
    });

    it("should return empty array when empty names array is provided", async () => {
      const result = await store.entries.getIconsAndDescriptionsForEntries([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("paginateEntries", () => {
    afterEach(async () => {
      await store.entries.deleteAllEntries();
    });

    it("should search with no state", async () => {
      const entries = [
        makeTestEntry({ name: "alpha", description: "foo", state: "draft" }),
        makeTestEntry({ name: "beta", description: "bar", state: "published" }),
        makeTestEntry({ name: "gamma", description: "baz", state: "archived" }),
      ];
      await store.entries.addEntries(entries, { ignoreDuplicates: false });
      // Search for 'alpha' (should match one entry regardless of state)
      let result = await store.entries.paginateEntries({
        pageIndex: 0,
        pageSize: 10,
        searchQuery: "alpha",
      });
      expect(result.entries.length).toBe(1);
      expect(result.entries[0].name).toBe("alpha");
      // Search for 'ba' (should match beta and gamma by description)
      result = await store.entries.paginateEntries({
        pageIndex: 0,
        pageSize: 10,
        searchQuery: "ba",
      });
      expect(result.entries.length).toBe(2);
      const names = result.entries.map((e) => e.name);
      expect(names).toContain("beta");
      expect(names).toContain("gamma");
    });

    it("should search with a state", async () => {
      const entries = [
        makeTestEntry({ name: "alpha", description: "foo", state: "draft" }),
        makeTestEntry({ name: "beta", description: "bar", state: "published" }),
        makeTestEntry({ name: "gamma", description: "baz", state: "archived" }),
      ];
      await store.entries.addEntries(entries, { ignoreDuplicates: false });
      // Search for 'ba' with state 'archived' (should match only gamma)
      const result = await store.entries.paginateEntries({
        pageIndex: 0,
        pageSize: 10,
        searchQuery: "ba",
        state: "archived",
      });
      expect(result.entries.length).toBe(1);
      expect(result.entries[0].name).toBe("gamma");
      expect(result.entries[0].state).toBe("archived");
    });

    it("should filter by a single state", async () => {
      const entries = [
        makeTestEntry({ state: "draft" }),
        makeTestEntry({ state: "published" }),
        makeTestEntry({ state: "archived" }),
      ];
      await store.entries.addEntries(entries, { ignoreDuplicates: false });
      const result = await store.entries.paginateEntries({
        pageIndex: 0,
        pageSize: 10,
        state: "published",
      });
      expect(result.entries.length).toBe(1);
      expect(result.entries[0].state).toBe("published");
    });

    it("should filter by multiple states", async () => {
      const entries = [
        makeTestEntry({ state: "draft" }),
        makeTestEntry({ state: "published" }),
        makeTestEntry({ state: "archived" }),
      ];
      await store.entries.addEntries(entries, { ignoreDuplicates: false });
      const result = await store.entries.paginateEntries({
        pageIndex: 0,
        pageSize: 10,
        state: ["published", "archived"],
      });
      expect(result.entries.length).toBe(2);
      expect(result.entries.some((e) => e.state === "published")).toBe(true);
      expect(result.entries.some((e) => e.state === "archived")).toBe(true);
    });
  });
});
