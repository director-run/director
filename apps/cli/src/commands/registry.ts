import type { EntryGetParams } from "@director.run/registry/db/schema";
import { enrichEntryTools } from "@director.run/registry/enrichment/enrich-tools";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { spinnerWrap } from "@director.run/utilities/cli/loader";
import { confirm } from "@inquirer/prompts";
import { input } from "@inquirer/prompts";
import { gatewayClient, registryClient } from "../client";
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
          .startMessage("fetching entries...")
          .successMessage("Entries fetched.")
          .run();
        listEntries(items.entries);
      }),
    );

  command
    .command("get <entryName>")
    .description("Get detailed information about a repository item")
    .action(
      actionWithErrorHandler(async (entryName: string) => {
        const item = await spinnerWrap(() =>
          registryClient.entries.getEntryByName.query({
            name: entryName,
          }),
        )
          .startMessage("fetching entry details...")
          .successMessage("Entry details fetched.")
          .run();
        printRegistryEntry(item);
      }),
    );

  command
    .command("readme <entryName>")
    .description("Print the readme for a repository item")
    .action(
      actionWithErrorHandler(async (entryName: string) => {
        const item = await spinnerWrap(() =>
          registryClient.entries.getEntryByName.query({
            name: entryName,
          }),
        )
          .startMessage("fetching entry details...")
          .successMessage("Entry details fetched.")
          .run();
        printReadme(item);
      }),
    );

  command
    .command("install <proxyId> <entryName>")
    .description("Add a server from the registry to a proxy.")
    .action(
      actionWithErrorHandler(async (proxyId: string, entryName: string) => {
        const entry = await spinnerWrap(() =>
          registryClient.entries.getEntryByName.query({
            name: entryName,
          }),
        )
          .startMessage("fetching entry...")
          .successMessage("Entry fetched.")
          .run();
        console.log("---");
        console.log("---");
        console.log("---");
        console.log("---");
        const parameters = await promptForParameters(entry);
        const proxy = await spinnerWrap(() =>
          gatewayClient.registry.addServerFromRegistry.mutate({
            proxyId,
            entryName,
            parameters,
          }),
        )
          .startMessage("installing server...")
          .successMessage(`Registry entry ${entryName} added to ${proxyId}`)
          .run();
      }),
    );

  async function promptForParameters(
    entry: EntryGetParams,
  ): Promise<Record<string, string>> {
    const parameters = entry.parameters;

    if (!parameters) {
      return {};
    }
    const answers = await Promise.all(
      parameters.map(async (parameter) => {
        const answer = await input({
          message: parameter.name,
        });
        return { [parameter.name]: answer };
      }),
    );
    return Object.assign({}, ...answers);
  }

  command
    .command("uninstall <proxyId> <serverName>")
    .description("Remove a server from a proxy")
    .action(
      actionWithErrorHandler(async (proxyId: string, serverName: string) => {
        const proxy = await spinnerWrap(() =>
          gatewayClient.store.removeServer.mutate({
            proxyId,
            serverName,
          }),
        )
          .startMessage("removing server...")
          .successMessage(`Server ${serverName} removed from ${proxyId}`)
          .run();
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
          .startMessage("purging registry...")
          .successMessage("Registry successfully purged")
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
          .startMessage("importing entries...")
          .successMessage("Entries successfully imported")
          .run();
      }),
    );

  command
    .debugCommand("enrich")
    .description("Enrich entries")
    .action(
      actionWithErrorHandler(async () => {
        await spinnerWrap(() => registryClient.entries.enrich.mutate({}))
          .startMessage("enriching entries...")
          .successMessage("entries successfully enriched")
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
          .startMessage("getting stats...")
          .successMessage("Stats fetched.")
          .run();
        console.log(stats);
      }),
    );

  return command;
}
