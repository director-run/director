#!/usr/bin/env -S node --no-warnings --enable-source-maps

import { isDevelopment } from "@director.run/utilities/env";
import packageJson from "../package.json";
import { createClaudeCommand } from "../src/commands/claude";
import { registerCoreCommands } from "../src/commands/core";
import { createCursorCommands } from "../src/commands/cursor";
import { createDebugCommands } from "../src/commands/debug";
import { createRegistryCommands } from "../src/commands/registry";
import { createServiceCommands } from "../src/commands/service";
import { CustomCommand } from "./custom-command";
const program = new CustomCommand();

// process.exit = ((code?: number) => {
//   //   console.log(`Exit called with code ${code}, but ignored`);
//   return undefined as never;
// }) as typeof process.exit;

program
  .name("director")
  .description("Manage MCP servers seamlessly from the command line.")
  .version(packageJson.version);

registerCoreCommands(program);

program.addCommand(createClaudeCommand());
program.addCommand(createCursorCommands());
program.addCommand(createRegistryCommands());
program.addCommand(createServiceCommands());

if (isDevelopment()) {
  program.addCommand(createDebugCommands());
}

program.parse();
