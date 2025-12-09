#!/usr/bin/env -S node --no-warnings --enable-source-maps

// This needs to run before anything else so that the environment variables are set before the logger is initialized
import "../src/env";

import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import packageJson from "../package.json" assert { type: "json" };
import { checkForUpdates } from "../src/check-for-updates";
import { registerClientCommands } from "../src/commands/client";
import { registerCoreCommands } from "../src/commands/core";
import { registerMCPCommands } from "../src/commands/mcp";
import { registerPromptsCommands } from "../src/commands/prompts";
import { registerRegistryCommands } from "../src/commands/registry";
import { env } from "../src/env";

// add this to prevent the program from exiting (useful for working on help text in live reload)
// process.exit = (code?: number) => {};

await checkForUpdates();

const program = new DirectorCommand();

program
  .name("director")
  .showDebugCommands(env.DEBUG)
  .description(packageJson.description)
  .version(packageJson.version);

registerCoreCommands(program);
env.DEBUG && registerClientCommands(program);
registerRegistryCommands(program);
registerMCPCommands(program);
registerPromptsCommands(program);

program.addExamples(`
  $ director create my-playbook # Create a new playbook
  $ director add my-playbook --entry fetch # Add a server to a playbook
  $ director connect my-playbook --target claude-code # Connect my-playbook to claude-code
`);

program.parse();
