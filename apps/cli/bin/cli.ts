#!/usr/bin/env -S node --no-warnings --enable-source-maps
// This needs to run before anything else so that the environment variables are set before the logger is initialized
import "../src/env";

import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import packageJson from "../package.json";
import { registerClientCommands } from "../src/commands/client";
import { registerCoreCommands } from "../src/commands/core";
import { createRegistryCommands } from "../src/commands/registry";

// add this to prevent the program from exiting (useful for working on help text in live reload)
// process.exit = (code?: number) => {};

const program = new DirectorCommand();

program
  .name("director")
  .description("Manage MCP servers seamlessly from the command line.")
  .version(packageJson.version);

registerCoreCommands(program);
registerClientCommands(program);
program.addCommand(createRegistryCommands());

program.addExamples(`
  $ director create my-proxy
  $ director registry install my-proxy iterm
  $ director claude install my-proxy
`);

program.parse();
