import { actionWithErrorHandler, makeTable } from "@director.run/utilities/cli";
import { Command } from "commander";
import { type Store } from "../db/store";
import { enrichEntries } from "../enrichment/enrich";
import { prettyPrint } from "../helpers/pretty-print";
import { fetchRaycastRegistry } from "../importers/raycast";

export function registerEntriesCommands(store: Store) {
  const command = new Command("entries");

  command
    .command("purge")
    .description("Delete all entries from the database")
    .action(
      actionWithErrorHandler(async () => {
        await store.entries.deleteAllEntries();
      }),
    );

  command
    .command("import")
    .description("Seed the database with entries from awesome-mcp-servers")
    .action(
      actionWithErrorHandler(async () => {
        await store.entries.deleteAllEntries();
        await store.entries.addEntries(await fetchRaycastRegistry());
      }),
    );

  command
    .command("enrich")
    .description("Enrich")
    .action(
      actionWithErrorHandler(async () => {
        await enrichEntries(store);
      }),
    );

  command
    .command("stats")
    .description("Stats")
    .action(
      actionWithErrorHandler(async () => {
        console.log(await store.entries.getStatistics());
      }),
    );

  command
    .command("ls")
    .description("List all entries")
    .action(
      actionWithErrorHandler(async () => {
        const entries = await store.entries.getAllEntries();
        const table = makeTable(["Name", "Command", "hasReadme", "parameters"]);
        for (const entry of entries) {
          if (entry.transport.type === "stdio") {
            table.push([
              entry.name,
              [entry.transport.command, ...entry.transport.args].join(" "),
              !!entry.readme,
              entry.parameters?.map((p) => p.name).join(", "),
            ]);
          }
        }
        console.log(table.toString());
      }),
    );

  command
    .command("readme <name>")
    .description("show the readme of the entry behind the name")
    .action(
      actionWithErrorHandler(async (name: string) => {
        const entry = await store.entries.getEntryByName(name);
        console.log(entry.readme);
      }),
    );

  command
    .command("get <name>")
    .description(
      "Pretty print (with colours unless it's super verbose) the json object of the entry behind the name",
    )
    .action(
      actionWithErrorHandler(async (name: string) => {
        const entry = await store.entries.getEntryByName(name);
        console.log(prettyPrint(entry, { indentSize: 2, padding: 1 }));
      }),
    );

  return command;
}
