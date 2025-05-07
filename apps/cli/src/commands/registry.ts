import { trpc } from "@director.run/service/trpc/client";

import { makeTable } from "@director.run/utilities/cli";
import { actionWithErrorHandler } from "@director.run/utilities/cli";
import chalk from "chalk";
import { Command } from "commander";
import type { JsonValue } from "type-fest";

export function registerRegistryCommands(program: Command) {
  program
    .command("registry:ls")
    .description("List all available servers in the registry")
    .action(
      actionWithErrorHandler(async () => {
        const items = await trpc.registry.list.query();
        const table = makeTable(["Id", "Description"]);
        table.push(
          ...items.map((item) => {
            return [item.id, truncateDescription(item.description)];
          }),
        );
        console.log(table.toString());
      }),
    );

  program
    .command("registry:get <entryId>")
    .description("get detailed information about a repository item")
    .action(
      actionWithErrorHandler(async (id: string) => {
        try {
          const item = await trpc.registry.get.query({ id });
          console.log(colorizeJson(item));
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

function colorizeJson(obj: Record<string, JsonValue>): string {
  const entries = Object.entries(obj)
    .map(([key, value]) => {
      const coloredKey = chalk.white.bold(`"${key}"`);
      const formattedValue =
        typeof value === "string"
          ? `"${value}"`
          : JSON.stringify(value, null, 2);
      return `  ${coloredKey}: ${formattedValue}`;
    })
    .join(",\n");
  return `{\n${entries}\n}`;
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
