import { makeTable } from "@director.run/utilities/cli";
import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import chalk from "chalk";
import { gatewayClient, registryClient } from "../client";
import { loader } from "@director.run/utilities/cli/loader";
import { red } from "@director.run/utilities/cli/colors";

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
        spinner.start();
        const items = await registryClient.entries.getEntries.query({
          pageIndex: 0,
          pageSize: 100,
        });
        spinner.succeed();
        const table = makeTable(["Name", "Description"]);
        table.push(
          ...items.entries.map((item) => {
            return [item.name, truncateDescription(item.description)];
          }),
        );
        console.log(table.toString());
      }),
    );

  command
    .command("get <entryName>")
    .description("get detailed information about a repository item")
    .action(
      actionWithErrorHandler(async (entryName: string) => {
        
          const spinner = loader();
          spinner.start();
          try {
            const item = await registryClient.entries.getEntryByName.query({
              name: entryName,
            });
            spinner.succeed();
            console.log(JSON.stringify(item, null, 2));
          } catch (error) {
            spinner.fail(error instanceof Error ? error.message : "unknown error");
            
          }
      }),
    );

  command
    .command("install <proxyId> <entryName>")
    .description("Add a server from the registry to a proxy.")
    .action(
      actionWithErrorHandler(async (proxyId: string, entryName: string) => {
        const spinner = loader();
        spinner.start();
        const proxy = await gatewayClient.registry.addServerFromRegistry.mutate(
          {
            proxyId,
            entryName,
          },
        );
        spinner.succeed();
        console.log(`Registry entry ${entryName} added to ${proxy.id}`);
      }),
    );

  command
    .command("uninstall <proxyId> <serverName>")
    .description("Remove a server from a proxy")
    .action(
      actionWithErrorHandler(async (proxyId: string, serverName: string) => {
        const spinner = loader();
        spinner.start();
        const proxy = await gatewayClient.store.removeServer.mutate({
          proxyId,
          serverName,
        });
        spinner.succeed(`server ${serverName} removed from ${proxy.id}`);
      }),
    );

  command
    .debugCommand("purge")
    .description("Delete all entries from the database")
    .action(
      actionWithErrorHandler(async () => {
        const spinner = loader();
        spinner.start();
        await registryClient.entries.purge.mutate({});
        spinner.succeed();
      }),
    );

  command
    .debugCommand("import")
    .description("Seed the database with entries from awesome-mcp-servers")
    .action(
      actionWithErrorHandler(async () => {
        const spinner = loader();
        spinner.start();
        await registryClient.entries.import.mutate({});
        spinner.succeed();
      }),
    );

  command
    .debugCommand("enrich")
    .description("enrich entries")
    .action(
      actionWithErrorHandler(async () => {
        const spinner = loader();
        spinner.start();
        await registryClient.entries.enrich.mutate({});
        spinner.succeed();
      }),
    );

  command
    .debugCommand("stats")
    .description("get counts")
    .action(
      actionWithErrorHandler(async () => {
        const spinner = loader();
        spinner.start();
        const stats = await registryClient.entries.stats.query({});
        spinner.succeed();
        console.log(stats);
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
