#!/usr/bin/env -S node --no-warnings --enable-source-maps

import { Command } from "commander";
import packageJson from "../package.json";
import { registerEntriesCommands } from "../src/commands/entries";
import { registerServerCommands } from "../src/commands/server";
import { createStore } from "../src/db/store";

const program = new Command();

program
  .name("registry")
  .description("Registry CLI")
  .version(packageJson.version);

const store = createStore();

program.addCommand(registerEntriesCommands(store));
program.addCommand(registerServerCommands());

program.parse();
