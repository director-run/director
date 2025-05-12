import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { Command } from "commander";
import { closeDatabase, db } from "../db";
import { prettyPrint } from "../db/pretty-print";
import { deleteAllEntries } from "../db/queries";
import { getEntryByName } from "../db/queries";
import { entriesTable } from "../db/schema";
import { seedDatabase } from "../db/seed";

export async function dumpToCSV() {
  // Fetch all entries
  const entries = await db.select().from(entriesTable);

  // Define CSV headers
  const headers = [
    "id",
    "name",
    "title",
    "description",
    "is_official",
    "transport_type",
    "transport_command",
    "transport_args",
    "transport_env",
    "homepage",
    "source_registry_name",
    "source_registry_entry_id",
    "categories",
    "tools",
    "parameters",
    "readme",
  ];

  // Convert entries to CSV rows
  const rows = entries.map((entry) => {
    return [
      entry.id,
      entry.name,
      entry.title,
      entry.description,
      entry.isOfficial,
      entry.transport.type,
      entry.transport.type === "stdio" ? entry.transport.command : "",
      entry.transport.type === "stdio"
        ? JSON.stringify(entry.transport.args)
        : "",
      entry.transport.type === "stdio"
        ? JSON.stringify(entry.transport.env || {})
        : "",
      entry.homepage || "",
      entry.source_registry?.name || "",
      entry.source_registry?.entryId || "",
      JSON.stringify(entry.categories),
      JSON.stringify(entry.tools),
      JSON.stringify(entry.parameters),
      entry.readme || "",
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
    ...rows.map((row: string[]) => row.join(",")),
  ].join("\n");

  console.log(csvContent);
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
        await deleteAllEntries();
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
        const entry = await getEntryByName(name);
        console.log(prettyPrint(entry, { indentSize: 2, padding: 1 }));
        await closeDatabase();
      }),
    );
}
