import { count, eq, inArray } from "drizzle-orm";
import { db } from "./index";
import { type EntryCreateParams, entriesTable } from "./schema";

export interface AddEntriesOptions {
  ignoreDuplicates?: boolean;
}

export async function getEntryByName(name: string) {
  const entry = await db
    .select()
    .from(entriesTable)
    .where(eq(entriesTable.name, name))
    .limit(1);

  if (entry.length === 0) {
    throw new Error(`No entry found with name: ${name}`);
  }

  return entry[0];
}

export async function deleteAllEntries() {
  await db.delete(entriesTable);
}

export async function getAllEntries() {
  return await db.select().from(entriesTable);
}

export async function addEntry(entries: EntryCreateParams) {
  await db.insert(entriesTable).values(entries);
}

export async function getEntries(params: {
  page: number;
  limit: number;
}) {
  const { page, limit } = params;
  const offset = (page - 1) * limit;

  const entries = await db
    .select()
    .from(entriesTable)
    .limit(limit)
    .offset(offset);

  return entries;
}

export async function addEntries(
  entries: EntryCreateParams[],
  options: AddEntriesOptions = {},
) {
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
      return;
    }

    await db.transaction(async (tx) => {
      await tx.insert(entriesTable).values(newEntries);
    });
  } else {
    await db.transaction(async (tx) => {
      await tx.insert(entriesTable).values(entries);
    });
  }
}

export async function countEntries(): Promise<number> {
  const result = await db.select({ count: count() }).from(entriesTable);
  return result[0].count;
}
