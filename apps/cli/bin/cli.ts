#!/usr/bin/env -S node --no-warnings --enable-source-maps
// This needs to run before anything else so that the environment variables are set before the logger is initialized
import "../src/config";

import { DirectorCommand } from "@director.run/utilities/cli";
import { isDevelopment } from "@director.run/utilities/env";
import packageJson from "../package.json";
import { createClaudeCommand } from "../src/commands/claude";
import { registerCoreCommands } from "../src/commands/core";
import { createCursorCommands } from "../src/commands/cursor";
import { createDebugCommands } from "../src/commands/debug";
import { createRegistryCommands } from "../src/commands/registry";

const program = new DirectorCommand();

program
  .name("director")
  .description("Manage MCP servers seamlessly from the command line.")
  .version(packageJson.version);

registerCoreCommands(program);

program.addCommand(createClaudeCommand());
program.addCommand(createCursorCommands());
program.addCommand(createRegistryCommands());

if (isDevelopment()) {
  program.addCommand(createDebugCommands());
}

program.parse();
