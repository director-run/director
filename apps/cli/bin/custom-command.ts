#!/usr/bin/env node

import chalk from "chalk";
import { Command, type HelpContext } from "commander";

export class CustomCommand extends Command {
  constructor() {
    super();
  }

  helpInformation(context?: HelpContext): string {
    // return super.helpInformation(context);
    return makeHelpText(this);
  }
}

function makeHelpText(program: Command) {
  const required = (t: string) => ["<", t, ">"].join("");
  const optional = (t: string) => ["[", t, "]"].join("");
  const concat = (a: string[]) => a.join(" ");

  const lines = [];

  lines.push(program.description());
  lines.push("");
  lines.push(chalk.white.bold(`USAGE`));
  lines.push(`  director ${required("command")} [subcommand] [flags]`);
  lines.push("");
  lines.push(chalk.white.bold(`CORE COMMANDS`));

  const makeLine = (cmd: Command) => {
    const args = cmd.registeredArguments
      .map((arg) =>
        arg.required ? required(arg.name()) : optional(arg.name()),
      )
      .filter((arg) => arg !== "")
      .join(" ");

    const usage = concat([
      cmd.name(),
      args,
      cmd.options.length ? optional("options") : "",
    ]);

    const padding = " ".repeat(Math.max(0, 40 - usage.length));

    // const padding = " ".repeat(Math.max(0, 40 - usage.length));
    return `  ${usage}${padding}${cmd.description() || chalk.red("TODO")}`;
  };

  program.commands
    .toSorted(
      (a, b) => Number(!!a.commands.length) - Number(!!b.commands.length),
    )
    .forEach((cmd) => {
      if (cmd.commands.length) {
        lines.push("");
        lines.push(chalk.white.bold(cmd.name().toUpperCase()));

        cmd.commands.forEach((subcommand) => {
          lines.push(makeLine(subcommand));
        });
      } else {
        lines.push(makeLine(cmd));
      }
    });

  lines.push("");
  lines.push(chalk.white.bold(`FLAGS`));
  lines.push(`  --help      Show help for command`);
  lines.push(`  --version   Show director version`);
  lines.push("");
  lines.push("");

  return lines.join("\n");
}
