import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { Command } from "commander";
import { prettyPrint } from "../db/pretty-print";
import { makeStore } from "../db/store";
import { fetchRaycastRegistry } from "../importers/raycast";

export async function dumpToCSV() {
  const store = makeStore();

  // Fetch all entries
  const entries = await store.entries.getAllEntries();

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
  await store.close();
}

export function registerDbCommands(program: Command) {
  program
    .command("db:purge")
    .description("Delete all entries from the database")
    .action(
      actionWithErrorHandler(async () => {
        const store = makeStore();
        await store.entries.deleteAllEntries();
        await store.close();
      }),
    );

  program
    .command("db:seed")
    .description("Seed the database with entries from awesome-mcp-servers")
    .action(
      actionWithErrorHandler(async () => {
        const store = makeStore();
        await store.entries.addEntries(await fetchRaycastRegistry());
        await store.close();
      }),
    );

  program
    .command("db:get <name>")
    .description(
      "Pretty print (with colours unless it's super verbose) the json object of the entry behind the name",
    )
    .action(
      actionWithErrorHandler(async (name: string) => {
        const store = makeStore();
        const entry = await store.entries.getEntryByName(name);
        console.log(prettyPrint(entry, { indentSize: 2, padding: 1 }));
        await store.close();
      }),
    );
}
