#!/usr/bin/env -S node --no-warnings --enable-source-maps

import { isDevelopment } from "@director.run/utilities/env";
import { Command } from "commander";
import packageJson from "../package.json";
import { registerClaudeCommands } from "../src/commands/claude";
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
registerClaudeCommands(program);
registerCursorCommands(program);
registerRegistryCommands(program);
registerServiceCommands(program);

if (isDevelopment()) {
  registerDebugCommands(program);
}

/// Group commands by their type and build help text
const commandGroups = new Map<string, string[]>();

program.commands.forEach((cmd) => {
  // Extract the command type from the command name (e.g., "proxy:create" -> "proxy")
  const type = cmd.name().split(":")[0] || "general";

  if (!commandGroups.has(type)) {
    commandGroups.set(type, []);
  }

  const description = cmd.description() || "No description available";
  commandGroups.get(type)?.push(`  ${cmd.name().padEnd(20)} ${description}`);
});

// Build the grouped help text
let groupedHelpText = "\nCommands by category:\n";
commandGroups.forEach((commands, type) => {
  groupedHelpText += `\n${type.charAt(0).toUpperCase() + type.slice(1)} Commands:\n`;
  groupedHelpText += commands.join("\n");
  groupedHelpText += "\n";
});

program.addHelpText(
  "after",
  groupedHelpText +
    `
Examples:
  $ director create my-proxy
  $ director server:add my-proxy fetch
  $ director install my-proxy claude
`,
);

program.parse();
