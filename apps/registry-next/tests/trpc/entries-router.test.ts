import {
  makeFooBarServerStdioConfig,
  makeHTTPTargetConfig,
} from "@director.run/gateway/test/fixtures";
import type {
  HTTPTransport,
  STDIOTransport,
} from "@director.run/utilities/schema";
import test, { expect } from "@playwright/test";

import { EntryStore } from "../../src/db/entries";
import { Entry } from "../../src/db/schema";
import {
  type RegistryClient,
  createRegistryClient,
} from "../../src/registry-client";
import { makeTestEntries, makeTestEntry } from "../fixtures/entries";

test.describe("Entries Router", () => {
  let entryStore: EntryStore;
  let unauthenticatedClient: RegistryClient;

  const TOTAL_ENTRIES = 20;
  const ENTRIES_PER_PAGE = 5;

  test.beforeAll(async () => {
    entryStore = new EntryStore();
    unauthenticatedClient = createRegistryClient(
      `http://localhost:${process.env.PORT}`,
    );
    await entryStore.deleteAllEntries();
  });

  test.describe("private endpoints", () => {
    let authenticatedClient: RegistryClient;
    test.beforeAll(() => {
      authenticatedClient = createRegistryClient(
        `http://localhost:${process.env.PORT}`,
        {
          apiKey: process.env.API_KEY,
        },
      );
    });

    test.describe("update entry", () => {
      let entry: Entry;

      test.beforeEach(async () => {
        await entryStore.deleteAllEntries();
        entry = (await entryStore.addEntry(
          makeTestEntry({
            ...makeTestEntry(),
            isConnectable: false,
            lastConnectionAttemptedAt: undefined,
            lastConnectionError: undefined,
          }),
        )) as Entry;
      });

      test("should be protected", () => {
        expectToThrowUnauthorized(
          unauthenticatedClient.entries.updateEntry.mutate({
            id: entry.id,
            isConnectable: true,
            lastConnectionAttemptedAt: new Date(),
            lastConnectionError: "test",
          }),
        );
      });

      test("should update the entry", async () => {
        await authenticatedClient.entries.updateEntry.mutate({
          id: entry.id,
          isConnectable: true,
          lastConnectionAttemptedAt: new Date(),
          lastConnectionError: "test",
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

        const updatedEntry = await entryStore.getEntryByName(entry.name);
        expect(updatedEntry).toBeDefined();
        expect(updatedEntry?.isConnectable).toBe(true);
        expect(updatedEntry?.lastConnectionAttemptedAt).toBeDefined();
        expect(updatedEntry?.lastConnectionError).toBe("test");
        expect(updatedEntry?.tools).toEqual([
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

    test("should be protected", async () => {
      await entryStore.deleteAllEntries();
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
        tools: 0,
      });
    });
  });

  test.describe("public endpoints", () => {
    test.beforeEach(async () => {
      await entryStore.deleteAllEntries();
      await entryStore.addEntries(makeTestEntries(TOTAL_ENTRIES));
    });

    test.describe("getTransportForEntry", () => {
      const testServerStdioConfig = makeFooBarServerStdioConfig();
      const testServerHTTPConfig = makeHTTPTargetConfig({
        name: "test-server-http",
        url: "https://example.com",
        headers: {
          Authorization: "Bearer <github-personal-access-token>",
        },
      });

      test.beforeEach(async () => {
        await entryStore.addEntry({
          name: testServerStdioConfig.name,
          title: testServerStdioConfig.name,
          description: "test",
          homepage: "test",
          readme: "test",
          transport: {
            type: "stdio",
            command: testServerStdioConfig.transport.command,
            args: [
              ...testServerStdioConfig.transport.args,
              "--noop",
              "<arg-param>",
            ],
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
        await entryStore.addEntry({
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
          transport: testServerHTTPConfig.transport,
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
          ...testServerStdioConfig.transport.args,
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

    test.describe("getEntries", () => {
      test("should handle pagination correctly", async () => {
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

      test("should handle search correctly", async () => {
        const testServerHTTPConfig = makeFooBarServerStdioConfig();
        await entryStore.addEntry({
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
          transport: testServerHTTPConfig.transport,
        });

        // Test first page
        const result1 = await unauthenticatedClient.entries.getEntries.query({
          pageIndex: 0,
          pageSize: ENTRIES_PER_PAGE,
          searchQuery: "foo",
        });
        expect(result1.entries).toHaveLength(1);
        expect(result1.entries[0]?.name).toEqual(testServerHTTPConfig.name);
        expect(result1.pagination).toEqual({
          pageIndex: 0,
          pageSize: ENTRIES_PER_PAGE,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        });
      });
    });
  });
});

async function expectToThrowUnauthorized(p: Promise<unknown>) {
  await expect(p).rejects.toThrow("Unauthorized");
}
