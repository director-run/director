import { Command } from "commander";

import { env } from "@director.run/core/config";
import packageJson from "../package.json";
import { registerClientCommands } from "../src/commands/client";
import { registerDebugCommands } from "../src/commands/debug";
import { registerProxyCommands } from "../src/commands/proxy";
import { registerRegistryCommands } from "../src/commands/registry";
import { registerServiceCommands } from "../src/commands/service";

const program = new Command();

program
  .name("director")
  .description("Director CLI")
  .version(packageJson.version);

registerProxyCommands(program);
registerClientCommands(program);
registerRegistryCommands(program);
registerServiceCommands(program);

if (env.NODE_ENV === "development") {
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
