#!/usr/bin/env -S node --no-warnings --enable-source-maps

import { Command } from "commander";
import packageJson from "../package.json";
import { registerEntriesCommands } from "../src/commands/entries";
import { env } from "../src/config";
import { createStore } from "../src/db/store";

const program = new Command();

program
  .name("registry")
  .description("Registry CLI")
  .version(packageJson.version);

const store = createStore({ connectionString: env.DATABASE_URL });

program.addCommand(registerEntriesCommands(store));

program.hook("postAction", async () => {
  await store.close();
});

process.on("exit", async () => {
  await store.close();
});

program.parse();
