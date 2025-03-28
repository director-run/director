import { PACKAGE_NAME, PACKAGE_VERSION } from "../src/config/env";
import { getLogger } from "../src/logger";

import { Command, Option } from "commander";
import { debug } from "../src/commands/debug";
import { listProxies } from "../src/commands/listProxies";
import { seed } from "../src/commands/seed";
import { startSSEServer } from "../src/commands/startSSEServer";
import { startStdioServer } from "../src/commands/startStdioServer";
import {
  installToClaude,
  restartClaude,
  uninstallFromClaude,
} from "../src/installer/claude";

const program = new Command();

const logger = getLogger("cli");

// Print out the full command that was called with all arguments
logger.info(`Command called: ${process.argv.join(" ")}`);

program
  .name(PACKAGE_NAME)
  .description("CLI to operate mcp server")
  .version(PACKAGE_VERSION);

program
  .command("start <name>")
  .description("Start an mcp server")
  .option("-t, --transport <type>", "Transport type (`stdio` or `sse`)")
  .action(async (name, options) => {
    try {
      if (options.transport === "stdio") {
        await startStdioServer(name);
      } else if (!options.transport || options.transport === "sse") {
        await startSSEServer(name);
      } else {
        console.error(`Unsupported transport type: ${options.transport}`);
        console.error("Supported types: stdio, sse");
        process.exit(1);
      }
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  });

program
  .command("ls")
  .alias("list")
  .description("List all configured MCP proxies")
  .action(() => {
    listProxies();
  });

program.command("debug").action(() => {
  debug();
});

program.command("seed").action(() => {
  seed();
});

function mandatoryOption(flags: string, description?: string) {
  const option = new Option(flags, description);
  option.makeOptionMandatory(true);
  return option;
}

program
  .command("install <name>")
  .description(
    "Install an mcp server to a client app (currently only Claude is supported)",
  )
  .addOption(
    mandatoryOption("-c, --client [type]", "client to install to").choices([
      "claude",
    ]),
  )
  .action(async (name, options) => {
    if (options.client === "claude") {
      await installToClaude({ name });
    } else {
      logger.error(`unsupported client: ${options.client}`);
    }
  });

program
  .command("uninstall <name>")
  .description(
    "Uninstall an mcp server from a client app (currently only Claude is supported)",
  )
  .addOption(
    mandatoryOption("-c, --client [type]", "client to uninstall from").choices([
      "claude",
    ]),
  )
  .action(async (name, options) => {
    if (options.client === "claude") {
      await uninstallFromClaude({ name });
    } else {
      logger.error(`unsupported client: ${options.client}`);
    }
  });

program
  .command("claude:restart")
  .description("Restart Claude")
  .action(async () => {
    await restartClaude();
  });

program.parse();
