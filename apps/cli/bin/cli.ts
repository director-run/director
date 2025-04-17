import {} from "@trpc/client";
import { Command } from "commander";
import packageJson from "../package.json";
import { registerClientCommands } from "../src/commands/client";
import { registerDebugCommands } from "../src/commands/debug";
import { registerProxyCommands } from "../src/commands/proxy";
import { registerRegistryCommands } from "../src/commands/registry";
import { registerServiceCommands } from "../src/commands/service";
import * as config from "../src/config";
import { proxySSEToStdio } from "../src/proxySSEToStdio";

const program = new Command();

program
  .name(packageJson.name)
  .description("Director CLI")
  .version(packageJson.version);

registerProxyCommands(program);
registerClientCommands(program);
registerRegistryCommands(program);
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

program.parse();
