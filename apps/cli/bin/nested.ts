#!/usr/bin/env node

import { Command, type HelpContext } from "commander";
import packageJson from "../package.json";

process.exit = ((code?: number) => {
  //   console.log(`Exit called with code ${code}, but ignored`);
  return undefined as never;
}) as typeof process.exit;

class CustomCommand extends Command {
  constructor() {
    super();
  }

  helpInformation(context?: HelpContext): string {
    // console.log(context);
    // return "THIS IS JAHHHH";
    // return super.helpInformation(context);
    return "\n";
  }
}

const program = new CustomCommand();

program
  .name("director")
  .description("Manage MCP servers seamlessly from the command line.")
  .version(packageJson.version)
  .helpCommand(false);

program
  .command("jo <me>")
  .description("Basic command fot he test")
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

function makeHelpText(program: Command) {
  const lines = [];
  lines.push(program.description());
  lines.push("");
  lines.push(`USAGE`);
  lines.push(`  director <command> <subcommand> [flags]`);
  lines.push("");
  lines.push(`CORE COMMANDS`);

  program.commands.forEach((cmd) => {
    lines.push(
      [
        cmd.name(),
        cmd.options.length ? "[options]" : "",
        cmd.registeredArguments.join("--"),
        cmd.description(),
      ].join(" "),
    );

    if (cmd.commands.length) {
      lines.push(cmd.name(), "has commands");
      cmd.commands.forEach((subcommand) => {
        lines.push("-->", subcommand.name());
      });
    }
  });

  lines.push("");
  lines.push(`FLAGS`);
  lines.push(`  --help      Show help for command`);
  lines.push(`  --version   Show director version`);

  return lines.join("\n");
}

console.log(makeHelpText(program));

program.parse(process.argv);
