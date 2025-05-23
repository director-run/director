import { TRPCClientError } from "@trpc/client";
import chalk from "chalk";
import Table from "cli-table3";
import { type CommandOptions, Option } from "commander";
import { Command, type HelpContext } from "commander";
import { isDevelopment } from "./env";
import { getLogger } from "./logger";

const logger = getLogger("cli");

export function actionWithErrorHandler<Args extends unknown[]>(
  handler: (...args: Args) => void | Promise<void>,
): (...args: Args) => Promise<void> {
  return async (...args: Args) => {
    try {
      await handler(...args);
    } catch (error) {
      if (error instanceof TRPCClientError) {
        logger.error({ message: `TRPCClientError ${error.message}` });
      } else if (error instanceof Error) {
        logger.error({ error, message: `${error.message}` });
      } else {
        logger.error("Unexpected error:", error);
      }
    }
  };
}

export function mandatoryOption(flags: string, description?: string) {
  const option = new Option(flags, description);
  option.makeOptionMandatory(true);
  return option;
}

export function makeTable(head: string[]) {
  return new Table({
    head,
    style: {
      head: ["blue", "bold"],
      border: [],
      compact: true,
    },

    chars: { mid: "", "left-mid": "", "mid-mid": "", "right-mid": "" },
  });
}

declare module "commander" {
  interface Command {
    _debug?: boolean; // or whatever type _hidden should be
  }
}

export class DirectorCommand extends Command {
  public debug = true;

  constructor(name?: string) {
    super(name);
    this.helpCommand(false);
  }

  debugCommand(nameAndArgs: string, opts?: CommandOptions) {
    if (isDevelopment()) {
      const command = super.command(nameAndArgs, opts);
      command._debug = true;
      return command;
    } else {
      return new Command(nameAndArgs);
    }
  }

  helpInformation(context?: HelpContext): string {
    // return super.helpInformation(context);
    return makeHelpText(this);
  }
}

function makeHelpText(program: DirectorCommand) {
  const required = (t: string) => ["<", t, ">"].join("");
  const optional = (t: string) => ["[", t, "]"].join("");
  const concat = (a: (string | undefined)[]) => a.filter(Boolean).join(" ");

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
      concat([
        cmd.parent && cmd.parent.parent ? cmd.parent?.name() : undefined,
        cmd.name(),
      ]),
      args,
      cmd.options.length ? optional("options") : "",
    ]);

    const padding = " ".repeat(Math.max(0, 45 - usage.length));

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
          const isDebug = subcommand._debug;
          if (isDebug) {
            lines.push(chalk.yellow(makeLine(subcommand)));
          } else {
            lines.push(makeLine(subcommand));
          }
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

  lines.push(chalk.white.bold(`EXAMPLES`));
  lines.push(`  $ director create my-proxy`);
  lines.push(`  $ director registry install my-proxy iterm`);
  lines.push(`  $ director claude install my-proxy`);
  lines.push("");
  lines.push("");

  return lines.join("\n");
}

export function printDirectorAscii(): void {
  console.log(`
         _ _               _             
        | (_)             | |            
      __| |_ _ __ ___  ___| |_ ___  _ __ 
     / _' | | '__/ _ \\/ __| __/ _ \\| '__|
    | (_| | | | |  __/ (__| || (_) | |   
     \\__,_|_|_|  \\___|\\___|\\__\\___/|_|   
                                         
                                         `);
}
