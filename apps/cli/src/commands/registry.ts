import { createRegistryClient } from "@director.run/registry/client";
import { makeTable } from "@director.run/utilities/cli";
import { actionWithErrorHandler } from "@director.run/utilities/cli";
import chalk from "chalk";
import { Command } from "commander";
import { env } from "../config";

const client = createRegistryClient(env.REGISTRY_URL);

export function registerRegistryCommands(program: Command) {
  program
    .command("registry:ls")
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

  program
    .command("registry:get <entryName>")
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
