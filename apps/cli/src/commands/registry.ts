import { enrichEntryTools } from "@director.run/registry/enrichment/enrich-tools";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { spinnerWrap } from "@director.run/utilities/cli/loader";
import { confirm } from "@inquirer/prompts";
import { registryClient } from "../client";
import { printReadme, printRegistryEntry } from "../views/registry-entry";
import { listEntries } from "../views/registry-list";

export function createRegistryCommands() {
  const command = new DirectorCommand("registry").description(
    "MCP server registry commands",
  );

  command
    .command("ls")
    .description("List all available servers in the registry")
    .action(
      actionWithErrorHandler(async () => {
        const items = await spinnerWrap(() =>
          registryClient.entries.getEntries.query({
            pageIndex: 0,
            pageSize: 100,
          }),
        )
          .start("fetching entries...")
          .succeed("Entries fetched.")
          .run();
        listEntries(items.entries);
      }),
    );

  command
    .command("get <entryName>")
    .description("Get detailed information about a registry item")
    .action(
      actionWithErrorHandler(async (entryName: string) => {
        const item = await spinnerWrap(() =>
          registryClient.entries.getEntryByName.query({
            name: entryName,
          }),
        )
          .start("fetching entry details...")
          .succeed("Entry details fetched.")
          .run();
        printRegistryEntry(item);
      }),
    );

  command
    .command("readme <entryName>")
    .description("Print the readme for a registry item")
    .action(
      actionWithErrorHandler(async (entryName: string) => {
        const item = await spinnerWrap(() =>
          registryClient.entries.getEntryByName.query({
            name: entryName,
          }),
        )
          .start("fetching entry details...")
          .succeed("Entry details fetched.")
          .run();
        printReadme(item);
      }),
    );

  command
    .debugCommand("purge")
    .description("Delete all entries from the database")
    .action(
      actionWithErrorHandler(async () => {
        const answer = await confirm({
          message: "Are you sure you want to purge the registry?",
          default: false,
        });

        if (!answer) {
          return;
        }
        await spinnerWrap(() => registryClient.entries.purge.mutate({}))
          .start("purging registry...")
          .succeed("Registry successfully purged")
          .run();
      }),
    );

  command
    .debugCommand("populate")
    .description("Seed the registry entries")
    .action(
      actionWithErrorHandler(async () => {
        const answer = await confirm({
          message: "Are you sure you want to re-populate the registry?",
          default: false,
        });

        if (!answer) {
          return;
        }
        await spinnerWrap(() => registryClient.entries.populate.mutate({}))
          .start("importing entries...")
          .succeed("Entries successfully imported")
          .run();
      }),
    );

  command
    .debugCommand("enrich")
    .description("Enrich entries")
    .action(
      actionWithErrorHandler(async () => {
        await spinnerWrap(() => registryClient.entries.enrich.mutate({}))
          .start("enriching entries...")
          .succeed("entries successfully enriched")
          .run();
      }),
    );

  command
    .debugCommand("enrich-tools")
    .description("Enrich entry tools")
    .action(
      actionWithErrorHandler(async () => {
        const answer = await confirm({
          message: "insecure, are you sure you want to do this?",
          default: false,
        });

        if (!answer) {
          return;
        }
        await enrichEntryTools(registryClient);
      }),
    );

  command
    .debugCommand("stats")
    .description("Get high level stats about the registry")
    .action(
      actionWithErrorHandler(async () => {
        const stats = await spinnerWrap(() =>
          registryClient.entries.stats.query({}),
        )
          .start("getting stats...")
          .succeed("Stats fetched.")
          .run();
        console.log(stats);
      }),
    );

  return command;
}
