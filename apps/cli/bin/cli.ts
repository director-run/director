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

class CustomCommand extends Command {
  constructor() {
    super();
  }

  // helpInformation(context?: HelpContext): string {
  //   console.log(context);
  //   return "THIS IS JAHHHH";
  // }
}

const program = new CustomCommand();

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

// program.helpInformation = function () {
//   return "";
// };

program.commands.forEach((cmd) => {
  // Extract the command type from the command name (e.g., "proxy:create" -> "proxy")
  const type = cmd.name().split(":")[0] || "general";

  if (!commandGroups.has(type)) {
    commandGroups.set(type, []);
  }

  const description = cmd.description() || "No description available";
  commandGroups.get(type)?.push(`  ${cmd.name().padEnd(20)} ${description}`);
});

// // Build the grouped help text
let groupedHelpText = "\nUSAGE\n  director <command> <subcommand> [flags]\n";

// Add main sections
const mainSections = [
  { title: "CORE COMMANDS", types: ["proxy", "service"] },
  { title: "AI COMMANDS", types: ["claude"] },
  { title: "INTEGRATION COMMANDS", types: ["cursor", "registry"] },
  { title: "DEVELOPMENT COMMANDS", types: ["debug"] },
];

mainSections.forEach((section) => {
  groupedHelpText += `\n${section.title}\n`;
  section.types.forEach((type) => {
    if (commandGroups.has(type)) {
      commandGroups.get(type)?.forEach((cmd) => {
        groupedHelpText += cmd + "\n";
      });
    }
  });
});

// Add flags section
groupedHelpText += "\nFLAGS\n";
groupedHelpText += "  --help      Show help for command\n";
groupedHelpText += "  --version   Show director version\n";

// Add examples
groupedHelpText += "\nEXAMPLES\n";
groupedHelpText += "  $ director create my-proxy\n";
groupedHelpText += "  $ director server:add my-proxy fetch\n";
groupedHelpText += "  $ director install my-proxy claude\n";

program.addHelpText("after", groupedHelpText);

program.parse();
