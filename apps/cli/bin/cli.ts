import { createTRPCClient, httpBatchLink } from "@trpc/client";
import Table from "cli-table3";
import { Command, Option } from "commander";
import superjson from "superjson";
import type { AppRouter } from "../../backend/src/http/routers/trpc";
import packageJson from "../package.json";
import * as config from "../src/config";

const program = new Command();

// Create tRPC client
const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `http://localhost:${config.PORT}/trpc`,
      transformer: superjson,
    }),
  ],
});

program
  .name(packageJson.name)
  .description("Director CLI")
  .version(packageJson.version);

program
  .command("ls")
  .alias("list")
  .description("List all configured MCP proxies")
  .action(async () => {
    try {
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
    } catch (error) {
      console.error("Failed to fetch proxies:", error);
    }
  });

program
  .command("start")
  .description("Start the proxy server for all proxies")
  .action(async () => {
    console.log("todo");
  });

program.command("debug").action(async () => {
  console.log("todo");
});

program.command("seed").action(() => {
  console.log("todo");
});

program
  .command("sse2stdio <sse_url>")
  .description("Proxy a SSE connection to a stdio stream")
  .action(async (sseUrl) => {
    console.log("todo");
  });

function mandatoryOption(flags: string, description?: string) {
  const option = new Option(flags, description);
  option.makeOptionMandatory(true);
  return option;
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
  .action(async (proxyId, options) => {
    console.log("todo");
  });

program
  .command("uninstall <proxyId>")
  .description("Uninstall an mcp server from a client app")
  .addOption(
    mandatoryOption("-c, --client [type]", "client to uninstall from").choices([
      "claude",
      "cursor",
    ]),
  )
  .action(async (proxyId, options) => {
    console.log("todo");
  });

program
  .command("claude:restart")
  .description("Restart Claude")
  .action(async () => {
    console.log("todo");
  });

program.parse();
