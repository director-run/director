import { createRegistryClient } from "@director.run/registry/client";
import { makeTable } from "@director.run/utilities/cli";
import { actionWithErrorHandler } from "@director.run/utilities/cli";
import chalk from "chalk";
import { Command } from "commander";
import { gatewayClient } from "../client";
import { env } from "../config";

const client = createRegistryClient(env.REGISTRY_URL);

export function createRegistryCommands() {
  const command = new Command("registry");

  command
    .command("ls")
    .description("List all available servers in the registry")
    .action(
      actionWithErrorHandler(async () => {
        const items = await client.entries.getEntries.query({
          pageIndex: 0,
          pageSize: 100,
        });
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
        try {
          const item = await client.entries.getEntryByName.query({
            name: entryName,
          });
          console.log(JSON.stringify(item, null, 2));
        } catch (error) {
          if (error instanceof Error) {
            console.error(chalk.red(error.message));
          } else {
            console.error(chalk.red("An unknown error occurred"));
          }
        }
      }),
    );

  command
    .command("install <proxyId> <entryName>")
    .description("Add a server from the registry to a proxy.")
    .action(
      actionWithErrorHandler(async (proxyId: string, entryName: string) => {
        const proxy = await gatewayClient.store.addServerFromRegistry.mutate({
          proxyId,
          entryName,
        });
        console.log(`Registry entry ${entryName} added to ${proxy.id}`);
      }),
    );

  command
    .command("uninstall <proxyId> <serverName>")
    .description("Remove a server from a proxy")
    .action(
      actionWithErrorHandler(async (proxyId: string, serverName: string) => {
        const proxy = await gatewayClient.store.removeServer.mutate({
          proxyId,
          serverName,
        });
        console.log(`Server ${serverName} added to ${proxy.id}`);
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
