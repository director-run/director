import { enrichEntryTools } from "@director.run/registry/enrichment/enrich-tools";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { loader } from "@director.run/utilities/cli/loader";
import { confirm } from "@inquirer/prompts";
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
        const spinner = loader();
        spinner.start("fetching entries...");
        try {
          const items = await registryClient.entries.getEntries.query({
            pageIndex: 0,
            pageSize: 100,
          });
          spinner.stop();
          listEntries(items.entries);
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
          printRegistryEntry(item);
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
        const answer = await confirm({
          message: "Are you sure you want to purge the registry?",
          default: false,
        });

        if (!answer) {
          return;
        }
        const spinner = loader();
        spinner.start("purging registry...");
        try {
          await registryClient.entries.purge.mutate({});
          spinner.succeed("Registry successfully purged");
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
        const answer = await confirm({
          message: "Are you sure you want to re-populate the registry?",
          default: false,
        });

        if (!answer) {
          return;
        }
        const spinner = loader();
        spinner.start("importing entries...");
        try {
          await registryClient.entries.populate.mutate({});
          spinner.succeed("Entries successfully imported");
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
