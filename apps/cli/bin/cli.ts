import {} from "@trpc/client";
import chalk from "chalk";
import { Command } from "commander";
import packageJson from "../package.json";
import { registerClientCommands } from "../src/commands/client";
import { registerDebugCommands } from "../src/commands/debug";
import { registerProxyCommands } from "../src/commands/proxy";
import { registerRegistryCommands } from "../src/commands/registry";
import { registerServiceCommands } from "../src/commands/service";
import * as config from "../src/config";
import { makeTable, withErrorHandler } from "../src/helpers";
import { proxySSEToStdio } from "../src/proxySSEToStdio";
import { trpc } from "../src/trpc";

const program = new Command();

program
  .name(packageJson.name)
  .description("Director CLI")
  .version(packageJson.version);

registerProxyCommands(program);
registerRegistryCommands(program);
registerClientCommands(program);
registerServiceCommands(program);

if (config.DEBUG_MODE) {
  registerDebugCommands(program);
}

program
  .command("sse2stdio <sse_url>")
  .description("Proxy a SSE connection to a stdio stream")
  .action(async (sseUrl) => {
    await proxySSEToStdio(sseUrl);
  });

function truncateDescription(
  description: string,
  maxWidth: number = 100,
): string {
  if (description.length <= maxWidth) {
    return description;
  }
  return description.slice(0, maxWidth - 3) + "...";
}

program
  .command("registry:ls")
  .description("List all available registry items")
  .action(
    withErrorHandler(async () => {
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

type JsonValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonValue[]
  | { [key: string]: JsonValue };

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

program
  .command("registry:get <entryId>")
  .description("get detailed information about a repository item")
  .action(
    withErrorHandler(async (id: string) => {
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

program.parse();
