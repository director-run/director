import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { Command } from "commander";
import { closeDatabase, db } from "../db";
import { prettyPrint } from "../db/pretty-print";
import { purgeDatabase } from "../db/purge";
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
        const entry = await getEntryByName(name);
        console.log(prettyPrint(entry, { indentSize: 2, padding: 1 }));
        await closeDatabase();
      }),
    );
}
