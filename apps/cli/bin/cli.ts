import {} from "@trpc/client";
import chalk from "chalk";
import Table from "cli-table3";
import { Command } from "commander";
import { seed } from "../../backend/src/services/db/seed";
import packageJson from "../package.json";
import * as config from "../src/config";
import { mandatoryOption, withErrorHandler } from "../src/helpers";
import { proxySSEToStdio } from "../src/proxySSEToStdio";
import { trpc } from "../src/trpc";

const program = new Command();

program
  .name(packageJson.name)
  .description("Director CLI")
  .version(packageJson.version);

function makeTable(head: string[]) {
  return new Table({
    head,
    style: {
      head: ["blue", "bold"],
      border: [],
      compact: true,
    },

    chars: { mid: "", "left-mid": "", "mid-mid": "", "right-mid": "" },
  });
}
program
  .command("ls")
  .alias("list")
  .description("List all configured MCP proxies")
  .action(
    withErrorHandler(async () => {
      const proxies = await trpc.store.getAll.query();

      if (proxies.length === 0) {
        console.log("no proxies configured yet.");
      } else {
        const table = makeTable(["id", "name", "url"]);

        table.push(
          ...proxies.map((proxy) => [proxy.id, proxy.name, proxy.url]),
        );

        console.log(table.toString());
      }
    }),
  );

program
  .command("info <proxyId>")
  .description("Get the info for a proxy")
  .action(
    withErrorHandler(async (proxyId: string) => {
      const proxy = await trpc.store.get.query({ proxyId });

      if (!proxy) {
        console.error(`proxy ${proxyId} not found`);
        return;
      }

      console.log(`id=${proxy.id}`);
      console.log(`name=${proxy.name}`);

      const table = makeTable(["name", "transport", "url/command"]);

      table.push(
        ...proxy.servers.map((server) => [
          server.name,
          server.transport.type,
          server.transport.type === "sse"
            ? server.transport.url
            : [server.transport.command, ...(server.transport.args ?? [])].join(
                " ",
              ),
        ]),
      );

      console.log(table.toString());
    }),
  );

program
  .command("start")
  .description("Start the proxy server for all proxies")
  .action(
    withErrorHandler(async () => {
      console.log("todo");
    }),
  );

if (config.DEBUG_MODE) {
  program.command("debug").action(
    withErrorHandler(async () => {
      console.log("----------------");
      console.log("__dirname: ", __dirname);
      console.log("__filename: ", __filename);
      console.log(`config:`, config);
      console.log("----------------");
    }),
  );
  program.command("seed").action(
    withErrorHandler(() => {
      seed();
    }),
  );
}

program
  .command("sse2stdio <sse_url>")
  .description("Proxy a SSE connection to a stdio stream")
  .action(async (sseUrl) => {
    await proxySSEToStdio(sseUrl);
  });

interface InstallOptions {
  client: "claude" | "cursor";
}

program
  .command("install <proxyId>")
  .description("Install an mcp server to a client app")
  .addOption(
    mandatoryOption("-c, --client [type]", "client to install to").choices([
      "claude",
      "cursor",
    ]),
  )
  .action(
    withErrorHandler(async (proxyId: string, options: InstallOptions) => {
      const result = await trpc.installer.install.mutate({
        proxyId,
        client: options.client,
      });
      console.log(result);
    }),
  );

program
  .command("uninstall <proxyId>")
  .description("Uninstall an mcp server from a client app")
  .addOption(
    mandatoryOption("-c, --client [type]", "client to uninstall from").choices([
      "claude",
      "cursor",
    ]),
  )
  .action(
    withErrorHandler(async (proxyId: string, options: InstallOptions) => {
      const result = await trpc.installer.uninstall.mutate({
        proxyId,
        client: options.client,
      });
      console.log(result);
    }),
  );

program
  .command("claude:restart")
  .description("Restart Claude")
  .action(
    withErrorHandler(async () => {
      console.log("todo");
    }),
  );

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
  .command("repo:ls")
  .description("List all available repository items")
  .action(
    withErrorHandler(async () => {
      const items = await trpc.repository.list.query();
      const table = makeTable(["Name", "Description"]);
      table.push(
        ...items.map((item) => {
          return [item.name, truncateDescription(item.description)];
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
  .command("repo:info <name>")
  .description("Get detailed information about a repository item")
  .action(
    withErrorHandler(async (name: string) => {
      try {
        const item = await trpc.repository.get.query({ name });
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
