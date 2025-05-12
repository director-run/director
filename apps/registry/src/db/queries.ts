import { eq } from "drizzle-orm";
import { db } from "./index";
import { entriesTable } from "./schema";

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

export async function purgeDatabase() {
  await db.delete(entriesTable);
  console.log("Successfully purged database");
}

export async function insertServersIntoDatabase(
  servers: Awaited<
    ReturnType<typeof import("../importers/awesome-mcp").fetchAwesomeMCPEntries>
  >,
) {
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

    // Insert new entry
    await db.insert(entriesTable).values({
      id: crypto.randomUUID(),
      name: server.name,
      description: server.description,
      verified: false,
      provider: server.provider || null,
      providerVerified: false,
      createdDate: new Date(),
      runtime: server.runtime || null,
      license: server.license || null,
      sourceUrl: server.url,
      transport: {
        type: "stdio",
        command: "echo",
        args: [server.url],
      },
      source: {
        type: "github",
        url: server.url,
      },
      sourceRegistry: {
        name: "awesome-mcp-servers",
      },
      categories: [server.category, ...server.attributes],
      tools: server.tools,
      parameters: server.parameters,
      readme: null,
    });
  }
}
