import { PACKAGE_NAME, PACKAGE_VERSION } from "../src/config";
import { getLogger } from "../src/helpers/logger";

import { Command, Option } from "commander";
import { debug } from "../src/commands/debug";
import { listProxies } from "../src/commands/listProxies";
import { seed } from "../src/commands/seed";
import {
  installToClaude,
  restartClaude,
  uninstallFromClaude,
} from "../src/services/installer/claude";
import { proxySSEToStdio } from "../src/services/proxy/proxySSEToStdio";
import { initStore } from "../src/services/store";
import { startServer } from "../src/startServer";

const program = new Command();

const logger = getLogger("cli");

await initStore();

program
  .name(PACKAGE_NAME)
  .description("CLI to operate mcp server")
  .version(PACKAGE_VERSION);

program
  .command("ls")
  .alias("list")
  .description("List all configured MCP proxies")
  .action(() => {
    listProxies();
  });

program
  .command("start")
  .description("Start the proxy server for all proxies")
  .action(async () => {
    await startServer();
  });

program.command("debug").action(() => {
  debug();
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
