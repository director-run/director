import { actionWithErrorHandler } from "@director.run/utilities/cli";
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
