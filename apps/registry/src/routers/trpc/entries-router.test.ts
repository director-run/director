import { makeFooBarServerStdioConfig } from "@director.run/gateway/test/fixtures";
import type {
  RegistryEntry,
  STDIOTransport,
} from "@director.run/utilities/schema";
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
          apiKey: env.API_KEY,
        },
      );
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
        tools: 0,
      });
    });
  });

  describe("public endpoints", () => {
    beforeEach(async () => {
      await registry.store.purge();
      await registry.store.entries.addEntries(makeTestEntries(TOTAL_ENTRIES));
    });

    describe("getTransportForEntry", () => {
      const testServerStdioConfig = makeFooBarServerStdioConfig();
      beforeEach(async () => {
        await registry.store.entries.addEntry({
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
              scope: "args",
              required: true,
              type: "string",
            },
            {
              name: "env-param",
              description: "",
              scope: "env",
              required: true,
              type: "string",
            },
          ],
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
        const transport =
          await unauthenticatedClient.entries.getTransportForEntry.query({
            entryName: testServerStdioConfig.name,
            parameters: {
              "arg-param": "arg-param-value",
              "env-param": "env-param-value",
            },
          });
        expect(transport.type).toEqual("stdio");
        expect((transport as STDIOTransport).env).toEqual({
          FIRST_PARAMETER: "env-param-value",
        });
        expect((transport as STDIOTransport).args).toEqual([
          ...testServerStdioConfig.transport.args,
          "--noop",
          "arg-param-value",
        ]);
      });
    });

    describe("getEntries", () => {
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
