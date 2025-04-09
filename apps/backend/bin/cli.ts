import { PROXY_DB_FILE_PATH } from "../src/constants";
import { getLogger } from "../src/helpers/logger";

import { Command, Option } from "commander";
import packageJson from "../package.json";
import { debug } from "../src/commands/debug";
import { listProxies } from "../src/commands/listProxies";
import { seed } from "../src/commands/seed";
import { createStore, storeExistsSync } from "../src/config";
import { restartApp } from "../src/helpers/restartApp";
import { App } from "../src/helpers/restartApp";
import { startServer } from "../src/http/startServer";
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

if (!storeExistsSync(PROXY_DB_FILE_PATH)) {
  await createStore(PROXY_DB_FILE_PATH);
}

program
  .name(packageJson.name)
  .description("CLI to operate mcp server")
  .version(packageJson.version);

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
