#!/usr/bin/env node

import { Command } from "commander";
import packageJson from "../package.json";
import { CustomCommand } from "./custom-command";

// process.exit = ((code?: number) => {
//   //   console.log(`Exit called with code ${code}, but ignored`);
//   return undefined as never;
// }) as typeof process.exit;

const program = new CustomCommand();

program
  .name("director")
  .description("Manage MCP servers seamlessly from the command line.")
  .version(packageJson.version)
  .helpCommand(false);

program
  .command("start <port>")
  .description("[core] start the server on the given port")
  .option("-f, --force", "Force the help")
  .action(() => {
    console.log("help");
  });
program
  .command("stop")
  .description("[core] stop the server on the given port")
  .option("-f, --force", "Force the help")
  .action(() => {
    console.log("help");
  });

function createCursorCommands() {
  const cursor = new Command("cursor");
  cursor
    .command("install <proxyId>")
    .description("Install a proxy to cursor")
    .option("-f, --force", "Force the install")
    .action((proxyId) => {
      console.log("cursor install", proxyId);
    });

  cursor.command("uninstall <proxyId>").action((proxyId) => {
    console.log("cursor uninstall", proxyId);
  });
  return cursor;
}

function createClaudeCommands() {
  const heat = new Command("claude");
  heat.command("restart <platform>").action((platform) => {
    console.log("claude restart", platform);
  });
  heat
    .command("sample <proxyId>")
    .description("sample")
    .option("-f, --force", "Force the sample")
    .action((proxyId) => {
      console.log("claude sample", proxyId);
    });
  return heat;
}

program.addCommand(createClaudeCommands());
program.addCommand(createCursorCommands());

program.parse(process.argv);
