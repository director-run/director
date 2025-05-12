import { count, eq } from "drizzle-orm";
import { db } from "./index";
import { entriesTable } from "./schema";
import type { EntryCreateParams } from "./types";

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

export async function addEntry(entries: EntryCreateParams) {
  await db.insert(entriesTable).values(entries);
}

export async function addEntries(
  entries: EntryCreateParams[],
  options: { ignoreDuplicates?: boolean } = {},
) {
  await db.transaction(async (tx) => {
    await tx.insert(entriesTable).values(entries);
  });
}

export async function countEntries(): Promise<number> {
  const result = await db.select({ count: count() }).from(entriesTable);
  return result[0].count;
}

export async function insertServersIntoDatabase(
  servers: Awaited<
    ReturnType<typeof import("../importers/awesome-mcp").fetchAwesomeMCPEntries>
  >,
) {
  const entries: EntryCreateParams[] = [];

  for (const server of servers) {
    // Check if entry already exists
    const existing = await db
      .select()
      .from(entriesTable)
      .where(eq(entriesTable.name, server.name))
      .limit(1);

    if (existing.length > 0) {
      console.log(`Skipping duplicate entry: ${server.name}`);
      continue;
    }

    // Create entry
    entries.push({
      name: server.name,
      title: server.name,
      description: server.description,
      isOfficial: false,
      transport: {
        type: "stdio",
        command: "echo",
        args: [server.url],
      },
      homepage: server.url,
      source_registry: {
        name: "awesome-mcp-servers",
        entryId: server.name,
      },
      categories: [server.category, ...server.attributes],
      tools: server.tools,
      parameters: server.parameters,
      readme: null,
    });
  }

  // Insert all entries in a single transaction
  if (entries.length > 0) {
    await insertEntriesIntoDatabase(entries);
  }
}
