import { count, eq, inArray } from "drizzle-orm";

import {} from "@director.run/utilities/error";
import { TRPCError } from "@trpc/server";
import { db } from "./client";
import { type Entry, type EntryCreateParams, entriesTable } from "./schema";

export class EntryStore {
  public async getEntryByName(name: string) {
    const entry = await db
      .select()
      .from(entriesTable)
      .where(eq(entriesTable.name, name))
      .limit(1);

    if (entry.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Entry not found",
      });
    }

    return entry[0] as Entry;
  }

  public async deleteAllEntries(): Promise<void> {
    await db.delete(entriesTable);
  }

  public async getAllEntries() {
    return await db.select().from(entriesTable);
  }

  public async addEntry(entry: EntryCreateParams) {
    return (await db.insert(entriesTable).values(entry).returning())[0];
  }

  public async deleteEntry(id: string) {
    await db.delete(entriesTable).where(eq(entriesTable.id, id));
  }

  public async updateEntry(id: string, entry: Partial<EntryCreateParams>) {
    await db.update(entriesTable).set(entry).where(eq(entriesTable.id, id));
  }

  public async getStatistics() {
    const entries = await db
      .select({
        id: entriesTable.id,
        isEnriched: entriesTable.isEnriched,
        isConnectable: entriesTable.isConnectable,
        lastConnectionError: entriesTable.lastConnectionError,
        lastConnectionAt: entriesTable.lastConnectionAttemptedAt,
        tools: entriesTable.tools,
      })
      .from(entriesTable);

    return {
      total: entries.length,
      enriched: entries.filter((e) => e.isEnriched).length,
      connectionAttempted: entries.filter((e) => e.lastConnectionAt).length,
      connectable: entries.filter((e) => e.isConnectable).length,
      connectableError: entries.filter((e) => e.lastConnectionError).length,
      tools: entries.filter((e) => e.tools?.length).length,
    };
  }

  public async paginateEntries(params: {
    pageIndex: number;
    pageSize: number;
  }) {
    const { pageIndex, pageSize } = params;
    const offset = pageIndex * pageSize;

    const [entries, totalCount] = await Promise.all([
      db
        .select({
          id: entriesTable.id,
          name: entriesTable.name,
          title: entriesTable.title,
          description: entriesTable.description,
          transport: entriesTable.transport,
          homepage: entriesTable.homepage,
          isOfficial: entriesTable.isOfficial,
          isConnectable: entriesTable.isConnectable,
          lastConnectionAttemptedAt: entriesTable.lastConnectionAttemptedAt,
          tools: entriesTable.tools,
          parameters: entriesTable.parameters,
          icon: entriesTable.icon,
        })
        .from(entriesTable)
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: count() })
        .from(entriesTable)
        .then((result) => result[0]?.count ?? 0),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      entries,
      pagination: {
        pageIndex,
        pageSize,
        totalItems: totalCount,
        totalPages,
        hasNextPage: pageIndex < totalPages - 1,
        hasPreviousPage: pageIndex > 0,
      },
    };
  }

  public async addEntries(
    entries: EntryCreateParams[],
    options: AddEntriesOptions = {
      ignoreDuplicates: true,
    },
  ): Promise<{ status: "success"; countInserted: number }> {
    if (options.ignoreDuplicates) {
      const existingEntries = await db
        .select({ name: entriesTable.name })
        .from(entriesTable)
        .where(
          inArray(
            entriesTable.name,
            entries.map((entry) => entry.name),
          ),
        );

      const existingNames = new Set(existingEntries.map((entry) => entry.name));
      const newEntries = entries.filter(
        (entry) => !existingNames.has(entry.name),
      );

      if (newEntries.length === 0) {
        return {
          status: "success",
          countInserted: newEntries.length,
        };
      }

      await db.transaction(async (tx) => {
        await tx.insert(entriesTable).values(newEntries);
      });

      return {
        status: "success",
        countInserted: newEntries.length,
      };
    } else {
      await db.transaction(async (tx) => {
        await tx.insert(entriesTable).values(entries);
      });

      return {
        status: "success",
        countInserted: entries.length,
      };
    }
  }

  public async countEntries(): Promise<number> {
    const result = await db.select({ count: count() }).from(entriesTable);
    return result[0]?.count ?? 0;
  }
}

interface AddEntriesOptions {
  ignoreDuplicates?: boolean;
}
