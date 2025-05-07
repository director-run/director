import { eq } from "drizzle-orm";
import { closeDatabase, db } from "../src/db";
import { entriesTable } from "../src/db/schema";
import { fetchAwesomeMCPEntries } from "../src/importers/awesome-mcp";

export async function insertServersIntoDatabase(
  servers: Awaited<ReturnType<typeof fetchAwesomeMCPEntries>>,
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
    });
  }
}

// Main execution
(async () => {
  try {
    const servers = await fetchAwesomeMCPEntries();
    await insertServersIntoDatabase(servers);
    await closeDatabase();
    console.log("Successfully seeded database!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
})();
