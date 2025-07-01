#!/usr/bin/env -S node --no-warnings --enable-source-maps

// This needs to run before anything else so that the environment variables are set before the logger is initialized
import "../src/env";

import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import packageJson from "../package.json";
import { checkForUpdates } from "../src/check-for-updates";
import { registerClientCommands } from "../src/commands/client";
import { registerCoreCommands } from "../src/commands/core";
import { registerRegistryCommands } from "../src/commands/registry";
import { env } from "../src/env";

// add this to prevent the program from exiting (useful for working on help text in live reload)
// process.exit = (code?: number) => {};

await checkForUpdates();

const program = new DirectorCommand();

program
  .name("director")
  .showDebugCommands(env.ENABLE_DEBUG_COMMANDS)
  .description(packageJson.description)
  .version(packageJson.version);

registerCoreCommands(program);
env.ENABLE_DEBUG_COMMANDS && registerClientCommands(program);
registerRegistryCommands(program);

program.addExamples(`
  $ director create my-proxy # Create a new proxy
  $ director add my-proxy --entry fetch # Add a server to a proxy
  $ director connect my-proxy --target claude # Connect my-proxy to claude
`);

program.parse();
