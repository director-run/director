#!/usr/bin/env node

import chalk from "chalk";
import { Command, type HelpContext } from "commander";

export class CustomCommand extends Command {
  constructor() {
    super();
  }

  helpInformation(context?: HelpContext): string {
    // console.log(context);
    // return "THIS IS JAHHHH";
    // return super.helpInformation(context);
    return makeHelpText(this);
    // return "\n";
  }
}

function makeHelpText(program: Command) {
  const required = (t: string) => [chalk.red("<"), t, chalk.red(">")].join("");
  const optional = (t: string) => ["[", t, "]"].join("");
  const concat = (a: string[]) => a.join(" ");

  const lines = [];
  lines.push("");

  lines.push(program.description());
  lines.push("");
  lines.push(chalk.white.bold(`USAGE\n`));
  lines.push(`director ${required("command")} [subcommand] [flags]`);
  lines.push("");
  lines.push(chalk.white.bold(`CORE COMMANDS\n`));

  const makeLine = (cmd: Command) => {
    const args = cmd.registeredArguments
      .map((arg) =>
        arg.required ? required(arg.name()) : optional(arg.name()),
      )
      .join(" ");

    return concat([
      concat([cmd.name(), args, cmd.options.length ? optional("options") : ""]),
      "   ->   ",
      cmd.description(),
    ]);
  };

  program.commands
    .toSorted(
      (a, b) => Number(!!a.commands.length) - Number(!!b.commands.length),
    )
    .forEach((cmd) => {
      if (cmd.commands.length) {
        lines.push("");
        lines.push(chalk.white.bold(cmd.name().toUpperCase()));
        lines.push("");

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
