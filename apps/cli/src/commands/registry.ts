import type { EntryGetParams } from "@director.run/registry/db/schema";
import { green, red } from "@director.run/utilities/cli/colors";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { makeTable } from "@director.run/utilities/cli/index";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { loader } from "@director.run/utilities/cli/loader";
import { gatewayClient, registryClient } from "../client";
import { enrichTools } from "./enrich-tools";
import { printReadme, printReistryEntry } from "./print-registry-entry";

export function createRegistryCommands() {
  const command = new DirectorCommand("registry").description(
    "MCP server registry commands",
  );

  function listEntries(items: EntryGetParams[]) {
    const table = makeTable(["Name", "Description", "Is Connectable"]);
    table.push(
      ...items.map((item) => {
        return [
          item.name,
          truncateDescription(item.description),
          item.isConnectable ? "yes" : "no",
        ];
      }),
    );
    console.log(table.toString());
  }

  function listDevEntries(
    items: ReturnType<typeof registryClient.entries.getEntries.query>,
  ) {
    const table = makeTable(["Name", "Is Connectable", "hasTools?"]);
    table.push(
      ...items.map((item) => {
        return [
          item.name,
          item.isConnectable ? green("yes") : red("no"),
          item.tools?.length,
        ];
      }),
    );
    console.log(table.toString());
  }

  command
    .command("ls")
    .description("List all available servers in the registry")
    .action(
      actionWithErrorHandler(async () => {
        const spinner = loader();
        spinner.start("fetching entries...");
        try {
          const items = await registryClient.entries.getEntries.query({
            pageIndex: 0,
            pageSize: 100,
          });
          spinner.stop();
          listDevEntries(items.entries);
        } catch (error) {
          spinner.fail(
            error instanceof Error ? error.message : "unknown error",
          );
        }
      }),
    );

  command
    .command("get <entryName>")
    .description("Get detailed information about a repository item")
    .action(
      actionWithErrorHandler(async (entryName: string) => {
        const spinner = loader();
        spinner.start("fetching entry details...");
        try {
          const item = await registryClient.entries.getEntryByName.query({
            name: entryName,
          });
          spinner.stop();
          printReistryEntry(item);
        } catch (error) {
          spinner.fail(
            error instanceof Error ? error.message : "unknown error",
          );
        }
      }),
    );

  command
    .command("readme <entryName>")
    .description("Print the readme for a repository item")
    .action(
      actionWithErrorHandler(async (entryName: string) => {
        const spinner = loader();
        spinner.start("fetching entry details...");

        try {
          const item = await registryClient.entries.getEntryByName.query({
            name: entryName,
          });
          spinner.stop();
          printReadme(item);
        } catch (error) {
          spinner.fail(
            error instanceof Error ? error.message : "unknown error",
          );
        }
      }),
    );

  command
    .command("install <proxyId> <entryName>")
    .description("Add a server from the registry to a proxy.")
    .action(
      actionWithErrorHandler(async (proxyId: string, entryName: string) => {
        const spinner = loader();
        spinner.start("adding server...");
        try {
          const proxy =
            await gatewayClient.registry.addServerFromRegistry.mutate({
              proxyId,
              entryName,
            });
          spinner.succeed(`Registry entry ${entryName} added to ${proxy.id}`);
        } catch (error) {
          spinner.fail(
            error instanceof Error ? error.message : "unknown error",
          );
        }
      }),
    );

  command
    .command("uninstall <proxyId> <serverName>")
    .description("Remove a server from a proxy")
    .action(
      actionWithErrorHandler(async (proxyId: string, serverName: string) => {
        const spinner = loader();
        spinner.start("removing server...");
        try {
          const proxy = await gatewayClient.store.removeServer.mutate({
            proxyId,
            serverName,
          });
          spinner.succeed(`Server ${serverName} removed from ${proxy.id}`);
        } catch (error) {
          spinner.fail(
            error instanceof Error ? error.message : "unknown error",
          );
        }
      }),
    );

  command
    .debugCommand("purge")
    .description("Delete all entries from the database")
    .action(
      actionWithErrorHandler(async () => {
        const spinner = loader();
        spinner.start("purging registry...");
        try {
          await registryClient.entries.purge.mutate({});
          spinner.succeed("registry successfully purged");
        } catch (error) {
          spinner.fail(
            error instanceof Error ? error.message : "unknown error",
          );
        }
      }),
    );

  command
    .debugCommand("populate")
    .description("Seed the registry entries")
    .action(
      actionWithErrorHandler(async () => {
        const spinner = loader();
        spinner.start("importing entries...");
        try {
          await registryClient.entries.populate.mutate({});
          spinner.succeed("entries successfully imported");
        } catch (error) {
          spinner.fail(
            error instanceof Error ? error.message : "unknown error",
          );
        }
      }),
    );

  command
    .debugCommand("enrich")
    .description("Enrich entries")
    .action(
      actionWithErrorHandler(async () => {
        const spinner = loader();
        spinner.start("enriching entries...");
        try {
          await registryClient.entries.enrich.mutate({});
          spinner.succeed("entries successfully enriched");
        } catch (error) {
          spinner.fail(
            error instanceof Error ? error.message : "unknown error",
          );
        }
      }),
    );

  command
    .debugCommand("enrich-tools")
    .description("Enrich entry tools")
    .action(
      actionWithErrorHandler(async () => {
        // const spinner = loader();
        // spinner.start("enriching tools...");
        // try {
        await enrichTools();
        // spinner.succeed("tools successfully enriched");
        // } catch (error) {
        //   spinner.fail(
        //     error instanceof Error ? error.message : "unknown error",
        //   );
        // }
      }),
    );

  command
    .debugCommand("stats")
    .description("Get high level stats about the registry")
    .action(
      actionWithErrorHandler(async () => {
        const spinner = loader();
        spinner.start("getting stats...");
        try {
          const stats = await registryClient.entries.stats.query({});
          spinner.stop();
          console.log(stats);
        } catch (error) {
          spinner.fail(
            error instanceof Error ? error.message : "unknown error",
          );
        }
      }),
    );

  return command;
}

function truncateDescription(
  description: string,
  maxWidth: number = 100,
): string {
  if (description.length <= maxWidth) {
    return description;
  }
  return description.slice(0, maxWidth - 3) + "...";
}
