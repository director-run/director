import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { Command } from "commander";
import { eq } from "drizzle-orm";
import { closeDatabase, db } from "../db";
import { entriesTable } from "../db/schema";
import { fetchAwesomeMCPEntries } from "../importers/awesome-mcp";

export async function dumpToCSV() {
  // Fetch all entries
  const entries = await db.select().from(entriesTable);

  // Define CSV headers
  const headers = [
    "id",
    "name",
    "description",
    "transport_type",
    "transport_command",
    "transport_args",
    "source_type",
    "source_url",
    "source_registry_name",
    "categories",
  ];

  // Convert entries to CSV rows
  const rows = entries.map((entry) => {
    return [
      entry.id,
      entry.name,
      entry.description,
      entry.transport.type,
      entry.transport.command,
      JSON.stringify(entry.transport.args),
      entry.source.type,
      entry.source.url,
      entry.sourceRegistry.name,
      JSON.stringify(entry.categories),
    ].map((value) => {
      // Escape quotes and wrap in quotes if contains comma or newline
      const stringValue = String(value);
      if (
        stringValue.includes(",") ||
        stringValue.includes("\n") ||
        stringValue.includes('"')
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  console.log(csvContent);
}

export async function purgeDatabase() {
  await db.delete(entriesTable);
  console.log("Successfully purged database");
}

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

export async function seedDatabase() {
  const servers = await fetchAwesomeMCPEntries();
  await insertServersIntoDatabase(servers);
  console.log("Successfully seeded database!");
}

export function registerDbCommands(program: Command) {
  program
    .command("db:dump")
    .description("Dump all registry entries to a CSV file")
    .action(
      actionWithErrorHandler(async () => {
        await dumpToCSV();
        await closeDatabase();
      }),
    );

  program
    .command("db:purge")
    .description("Delete all entries from the database")
    .action(
      actionWithErrorHandler(async () => {
        await purgeDatabase();
        await closeDatabase();
      }),
    );

  program
    .command("db:seed")
    .description("Seed the database with entries from awesome-mcp-servers")
    .action(
      actionWithErrorHandler(async () => {
        await seedDatabase();
        await closeDatabase();
      }),
    );

  program
    .command("db:get <name>")
    .description(
      "Pretty print (with colours unless it's super verbose) the json object of the entry behind the name",
    )
    .action(
      actionWithErrorHandler(async (name: string) => {
        console.log("Get", name);
      }),
    );
}
