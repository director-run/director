#!/usr/bin/env -S node --no-warnings --enable-source-maps

import { isDevelopment } from "@director.run/utilities/env";
import { Command } from "commander";
import packageJson from "../package.json";
import { createClaudeCommand } from "../src/commands/claude";
import { registerCursorCommands } from "../src/commands/cursor";
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
program.addCommand(createClaudeCommand());
registerCursorCommands(program);
registerRegistryCommands(program);
registerServiceCommands(program);

if (isDevelopment()) {
  registerDebugCommands(program);
}

program.parse();
