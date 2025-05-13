#!/usr/bin/env -S node --no-warnings --enable-source-maps

import { isDevelopment } from "@director.run/utilities/env";
import { Command } from "commander";
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

if (isDevelopment()) {
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
