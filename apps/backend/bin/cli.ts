import Table from "cli-table3";
import { Command, Option } from "commander";
import packageJson from "../package.json";
import { getLogger } from "../src/helpers/logger";
import { restartApp } from "../src/helpers/restartApp";
import { App } from "../src/helpers/restartApp";
import { startServer } from "../src/http/startServer";
import {
  getProxyConfigEntries,
  initConfigFile,
  readConfigFile,
} from "../src/services/config";
import { seed } from "../src/services/config/seed";
import {
  installToClaude,
  uninstallFromClaude,
} from "../src/services/installer/claude";
import {
  installToCursor,
  uninstallFromCursor,
} from "../src/services/installer/cursor";
import { proxySSEToStdio } from "../src/services/proxy/proxySSEToStdio";

const program = new Command();

const logger = getLogger("cli");

await initConfigFile();

program
  .name(packageJson.name)
  .description("CLI to operate mcp server")
  .version(packageJson.version);

program
  .command("ls")
  .alias("list")
  .description("List all configured MCP proxies")
  .action(async () => {
    const proxies = await getProxyConfigEntries();

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
  });

program
  .command("start")
  .description("Start the proxy server for all proxies")
  .action(async () => {
    await startServer();
  });

program.command("debug").action(async () => {
  console.log("----------------");
  console.log("__dirname: ", __dirname);
  console.log("__filename: ", __filename);
  console.log(`config:`, await readConfigFile());
  console.log("----------------");
});

program.command("seed").action(() => {
  seed();
});

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

program
  .command("install <name>")
  .description("Install an mcp server to a client app")
  .addOption(
    mandatoryOption("-c, --client [type]", "client to install to").choices([
      "claude",
      "cursor",
    ]),
  )
  .action(async (name, options) => {
    if (options.client === "claude") {
      await installToClaude({ name });
    } else if (options.client === "cursor") {
      await installToCursor({ name });
    } else {
      logger.error(`unsupported client: ${options.client}`);
    }
  });

program
  .command("uninstall <name>")
  .description("Uninstall an mcp server from a client app")
  .addOption(
    mandatoryOption("-c, --client [type]", "client to uninstall from").choices([
      "claude",
      "cursor",
    ]),
  )
  .action(async (name, options) => {
    if (options.client === "claude") {
      await uninstallFromClaude({ name });
    } else if (options.client === "cursor") {
      await uninstallFromCursor({ name });
    } else {
      logger.error(`unsupported client: ${options.client}`);
    }
  });

program
  .command("claude:restart")
  .description("Restart Claude")
  .action(async () => {
    await restartApp(App.CLAUDE);
  });

program.parse();
