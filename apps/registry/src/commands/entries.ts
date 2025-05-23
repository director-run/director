import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { Command } from "commander";
import { type Store } from "../db/store";
import { enrichEntries } from "../enrichment/enrich";
import { fetchRaycastRegistry } from "../importers/raycast";
import { getSeedEntries } from "../importers/seed";
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
        await store.entries.addEntries(getSeedEntries());
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

  return command;
}
