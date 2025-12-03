import {
  makeFooBarServerStdioConfig,
  makeHTTPTargetConfig,
} from "@director.run/gateway/test/fixtures";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  test,
} from "vitest";
import { type RegistryClient, createRegistryClient } from "../../client";
import { env } from "../../config";
import { Registry } from "../../registry";
import type {
  HTTPTransport,
  RegistryEntry,
  STDIOTransport,
} from "../../schemas";
import { entries } from "../../seed/entries";
import { makeTestEntries, makeTestEntry } from "../../test/fixtures/entries";

describe("Entries Router", () => {
  let registry: Registry;
  let unauthenticatedClient: RegistryClient;

  const TOTAL_ENTRIES = 20;
  const ENTRIES_PER_PAGE = 5;

  beforeAll(async () => {
    registry = await Registry.start({
      port: env.PORT,
      connectionString: env.DATABASE_URL,
    });
    unauthenticatedClient = createRegistryClient(
      `http://localhost:${env.PORT}`,
    );
    await registry.store.purge();
  });

  afterAll(async () => {
    await registry.stop();
  });

  describe("private endpoints", () => {
    let authenticatedClient: RegistryClient;
    beforeAll(() => {
      authenticatedClient = createRegistryClient(
        `http://localhost:${env.PORT}`,
        {
          apiKey: env.MANAGEMENT_API_KEY,
        },
      );
    });

    describe("populate", () => {
      it("should work", async () => {
        await authenticatedClient.entries.purge.mutate({});
        await authenticatedClient.entries.populate.mutate({});
        const stats = await authenticatedClient.entries.stats.query({});

        expect(stats).toHaveProperty("total", entries.length);
        expect(stats).toHaveProperty("draft", 0);
        expect(stats).toHaveProperty("published", entries.length);
      });
    });

    describe("update entry", () => {
      let entry: RegistryEntry;

      beforeEach(async () => {
        await registry.store.purge();
        entry = await registry.store.entries.addEntry(
          makeTestEntry({
            ...makeTestEntry(),
            isConnectable: false,
            lastConnectionAttemptedAt: undefined,
            lastConnectionError: undefined,
          }),
        );
      });

      it("should be protected", () => {
        expectToThrowUnauthorized(
          unauthenticatedClient.entries.updateEntry.mutate({
            id: entry.id,
            isConnectable: true,
            lastConnectionAttemptedAt: new Date(),
            lastConnectionError: "test",
          }),
        );
      });

      it("should update the entry", async () => {
        await authenticatedClient.entries.updateEntry.mutate({
          id: entry.id,
          isConnectable: true,
          lastConnectionAttemptedAt: new Date(),
          lastConnectionError: "test",
          transport: {
            type: "http",
            url: "http://new-url.com",
          },
          tools: [
            {
              name: "test",
              description: "test",
              inputSchema: {
                type: "object",
                required: [],
                properties: {},
              },
            },
          ],
        });

        const updatedEntry = await registry.store.entries.getEntryByName(
          entry.name,
        );
        expect(updatedEntry.isConnectable).toBe(true);
        expect(updatedEntry.lastConnectionAttemptedAt).toBeDefined();
        expect(updatedEntry.lastConnectionError).toBe("test");
        expect(updatedEntry.transport).toEqual({
          type: "http",
          url: "http://new-url.com",
        });
        expect(updatedEntry.tools).toEqual([
          {
            name: "test",
            description: "test",
            inputSchema: {
              type: "object",
              required: [],
              properties: {},
            },
          },
        ]);
      });
    });

    it("should be protected", async () => {
      await registry.store.purge();
      expectToThrowUnauthorized(unauthenticatedClient.entries.purge.mutate({}));
      expectToThrowUnauthorized(
        unauthenticatedClient.entries.enrich.mutate({}),
      );
      expectToThrowUnauthorized(
        unauthenticatedClient.entries.populate.mutate({}),
      );
      expectToThrowUnauthorized(unauthenticatedClient.entries.stats.query({}));
      expect(await authenticatedClient.entries.stats.query({})).toEqual({
        total: 0,
        enriched: 0,
        connectionAttempted: 0,
        connectable: 0,
        connectableError: 0,
        published: 0,
        archived: 0,
        draft: 0,
        tools: 0,
      });
    });
  });

  describe("public endpoints", () => {
    beforeEach(async () => {
      await registry.store.purge();
      await registry.store.entries.addEntries(makeTestEntries(TOTAL_ENTRIES), {
        state: "published",
      });
    });

    describe("getIconsAndDescriptionsForEntries", () => {
      beforeEach(async () => {
        await registry.store.purge();
        await registry.store.entries.addEntries(
          [
            makeTestEntry({
              name: "test-server-1",
              description: "Test server 1",
              icon: "test-icon-1.svg",
              state: "published",
            }),
            makeTestEntry({
              name: "test-server-2",
              description: "Test server 2",
              icon: "test-icon-2.svg",
              state: "published",
            }),
            makeTestEntry({
              name: "test-server-3",
              description: "Test server 3",
              icon: "test-icon-3.svg",
              state: "published",
            }),
          ],
          { ignoreDuplicates: false },
        );
      });

      it("should return icons and descriptions for existing entries", async () => {
        const result =
          await unauthenticatedClient.entries.getIconsAndDescriptionsForEntries.query(
            {
              names: ["test-server-1", "test-server-2", "test-server-3"],
            },
          );

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
        const result =
          await unauthenticatedClient.entries.getIconsAndDescriptionsForEntries.query(
            {
              names: ["test-server-1", "non-existent-server"],
            },
          );

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          name: "test-server-1",
          description: "Test server 1",
          icon: "test-icon-1.svg",
        });
      });

      it("should return empty array when no entries exist", async () => {
        const result =
          await unauthenticatedClient.entries.getIconsAndDescriptionsForEntries.query(
            {
              names: ["non-existent-server-1", "non-existent-server-2"],
            },
          );

        expect(result).toHaveLength(0);
      });

      it("should return empty array when empty names array is provided", async () => {
        const result =
          await unauthenticatedClient.entries.getIconsAndDescriptionsForEntries.query(
            {
              names: [],
            },
          );

        expect(result).toHaveLength(0);
      });
    });

    describe("getTransportForEntry", () => {
      const testServerStdioConfig = makeFooBarServerStdioConfig();
      const testServerHTTPConfig = makeHTTPTargetConfig({
        name: "test-server-http",
        url: "https://example.com",
        headers: {
          Authorization: "Bearer <github-personal-access-token>",
        },
      });

      beforeEach(async () => {
        await registry.store.entries.addEntry({
          name: testServerStdioConfig.name,
          title: testServerStdioConfig.name,
          description: "test",
          homepage: "test",
          readme: "test",
          transport: {
            type: "stdio",
            command: testServerStdioConfig.command,
            args: [...testServerStdioConfig.args, "--noop", "<arg-param>"],
            env: {
              FIRST_PARAMETER: "<env-param>",
            },
          },
          parameters: [
            {
              name: "arg-param",
              description: "",
              required: true,
              type: "string",
            },
            {
              name: "env-param",
              description: "",
              required: true,
              type: "string",
            },
          ],
        });
        await registry.store.entries.addEntry({
          name: testServerHTTPConfig.name,
          title: testServerHTTPConfig.name,
          description: "test-http",
          parameters: [
            {
              name: "github-personal-access-token",
              description: "",
              required: true,
              type: "string",
            },
          ],
          homepage: "test",
          readme: "test",
          transport: {
            type: "http",
            url: testServerHTTPConfig.url,
            headers: testServerHTTPConfig.headers,
          },
        });
      });

      test("should throw an error if a required parameter is missing", async () => {
        await expect(
          unauthenticatedClient.entries.getTransportForEntry.query({
            entryName: testServerStdioConfig.name,
            parameters: {
              "arg-param": "test",
            },
          }),
        ).rejects.toThrow();
        await expect(
          unauthenticatedClient.entries.getTransportForEntry.query({
            entryName: testServerStdioConfig.name,
            parameters: {
              "env-param": "test",
            },
          }),
        ).rejects.toThrow();
      });

      test("should return the transport for an entry with substituted parameters", async () => {
        const stdioTransport =
          await unauthenticatedClient.entries.getTransportForEntry.query({
            entryName: testServerStdioConfig.name,
            parameters: {
              "arg-param": "arg-param-value",
              "env-param": "env-param-value",
            },
          });
        expect(stdioTransport.type).toEqual("stdio");
        expect((stdioTransport as STDIOTransport).env).toEqual({
          FIRST_PARAMETER: "env-param-value",
        });
        expect((stdioTransport as STDIOTransport).args).toEqual([
          ...testServerStdioConfig.args,
          "--noop",
          "arg-param-value",
        ]);

        const httpTransport =
          await unauthenticatedClient.entries.getTransportForEntry.query({
            entryName: testServerHTTPConfig.name,
            parameters: {
              "github-personal-access-token":
                "github-personal-access-token-value",
            },
          });
        expect(httpTransport.type).toEqual("http");
        expect((httpTransport as HTTPTransport).headers).toEqual({
          Authorization: "Bearer github-personal-access-token-value",
        });
      });
    });

    describe("getEntries", () => {
      it("should handle search query correctly", async () => {
        // Add a few published entries and one with a unique name/description
        await registry.store.purge();
        await registry.store.entries.addEntries(
          [
            makeTestEntry({
              name: "alpha",
              description: "foo",
              state: "published",
            }),
            makeTestEntry({
              name: "beta",
              description: "bar",
              state: "published",
            }),
            makeTestEntry({
              name: "gamma",
              description: "baz",
              state: "published",
            }),
          ],
          { ignoreDuplicates: false },
        );
        // Search for 'alpha' (should match one entry)
        const result = await unauthenticatedClient.entries.getEntries.query({
          pageIndex: 0,
          pageSize: 10,
          searchQuery: "alpha",
        });
        expect(result.entries.length).toBe(1);
        expect(result.entries[0].name).toBe("alpha");
        // Search for 'ba' (should match beta and gamma by description)
        const result2 = await unauthenticatedClient.entries.getEntries.query({
          pageIndex: 0,
          pageSize: 10,
          searchQuery: "ba",
        });
        const names = result2.entries.map((e) => e.name);
        expect(names).toContain("beta");
        expect(names).toContain("gamma");
      });

      it("should not return draft entries", async () => {
        await registry.store.purge();
        await registry.store.entries.addEntries(
          [
            makeTestEntry({ name: "published-entry", state: "published" }),
            makeTestEntry({ name: "draft-entry", state: "draft" }),
          ],
          { ignoreDuplicates: false },
        );
        const result = await unauthenticatedClient.entries.getEntries.query({
          pageIndex: 0,
          pageSize: 10,
        });
        expect(result.entries.length).toBe(1);
        expect(result.entries[0].name).toBe("published-entry");
        // Ensure no draft entries are returned
        expect(result.entries.some((e) => e.name === "draft-entry")).toBe(
          false,
        );
      });

      it("should handle pagination correctly", async () => {
        // Test first page
        const result1 = await unauthenticatedClient.entries.getEntries.query({
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
        const result2 = await unauthenticatedClient.entries.getEntries.query({
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
        const result3 = await unauthenticatedClient.entries.getEntries.query({
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
});

async function expectToThrowUnauthorized(p: Promise<unknown>) {
  await expect(p).rejects.toThrow("Unauthorized");
}
