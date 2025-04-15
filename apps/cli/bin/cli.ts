import { createTRPCClient, httpBatchLink } from "@trpc/client";
import Table from "cli-table3";
import { Command, Option } from "commander";
import superjson from "superjson";
import type { AppRouter } from "../../backend/src/http/routers/trpc";
import { seed } from "../../backend/src/services/db/seed";
import { proxySSEToStdio } from "../../backend/src/services/proxy/proxySSEToStdio";

import packageJson from "../package.json";
import * as config from "../src/config";

const program = new Command();

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: config.DIRECTOR_URL,
      transformer: superjson,
      fetch(url, options) {
        return fetch(url, options).catch((error) => {
          if (error.code === "ConnectionRefused") {
            throw new Error(
              `Could not connect to the service on ${config.DIRECTOR_URL}. Is it running?`,
            );
          }
          throw error;
        });
      },
    }),
  ],
});

function withErrorHandler<Args extends unknown[]>(
  handler: (...args: Args) => void | Promise<void>,
): (...args: Args) => Promise<void> {
  return async (...args: Args) => {
    try {
      await handler(...args);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error("Error: An unexpected error occurred");
      }
    }
  };
}

program
  .name(packageJson.name)
  .description("Director CLI")
  .version(packageJson.version);

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
        const table = new Table({
          head: ["name", "servers"],
          style: {
            head: ["green"],
          },
        });
        table.push(
          ...proxies.map((proxy) => [
            proxy.name,
            proxy.servers.map((s) => s.name).join(","),
          ]),
        );

        console.log(table.toString());
      }
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

function mandatoryOption(flags: string, description?: string) {
  const option = new Option(flags, description);
  option.makeOptionMandatory(true);
  return option;
}

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

program.parse();
