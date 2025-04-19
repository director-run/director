import { Command } from "commander";

import packageJson from "../package.json";
import { registerClientCommands } from "../src/commands/client";
import { registerDebugCommands } from "../src/commands/debug";
import { registerProxyCommands } from "../src/commands/proxy";
import { registerRegistryCommands } from "../src/commands/registry";
import { registerServiceCommands } from "../src/commands/service";
import * as config from "../src/config";

const program = new Command();

program
  .name("director")
  .description("Director CLI")
  .version(packageJson.version);

registerProxyCommands(program);
registerClientCommands(program);
registerRegistryCommands(program);
registerServiceCommands(program);

if (config.DEBUG_MODE) {
  registerDebugCommands(program);
}

program.addHelpText(
  "after",
  `

Examples:
  $ director create my-proxy
  $ director server:add my-proxy fetch
  $ director install my-proxy claude
`,
);

program.parse();
