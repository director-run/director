import { Option } from "commander";
import { Command } from "commander";
import { isDevelopment } from "../env";
import { DirectorCommand } from "./director-command";
import { red, yellow, whiteBold } from "./colors";

const LEFT_PADDING = " ".repeat(2);

export function makeHelpText(program: DirectorCommand) {
  const lines = [];

  if (isDevelopment()) {
    lines.push(yellow("🚧 development commands appear in yellow 🚧"));
    lines.push("");
  }

  lines.push(program.description().trim());
  lines.push("");
  lines.push(makeHeader(`usage`));
  lines.push(
    LEFT_PADDING +
      concat([
        program.parent ? program.parent.name() : "",
        program.name(),
        required("command"),
        "[subcommand]",
        "[flags]",
      ]),
  );
  lines.push("");

  if (program.parent) {
    lines.push(makeHeader(`${program.name()} commands`));
  } else {
    // only root commands have core commands
    lines.push(makeHeader(`core commands`));
  }

  program.commands
    .toSorted(
      (a, b) => Number(!!a.commands.length) - Number(!!b.commands.length),
    )
    .forEach((cmd) => {
      if (cmd.commands.length) {
        lines.push("");
        lines.push(makeHeader(cmd.name()));

        cmd.commands.forEach((subcommand) => {
          lines.push(makeLine(subcommand));
        });
      } else {
        lines.push(makeLine(cmd));
      }
    });

  lines.push("");
  const opts: Option[] = [program._helpOption, ...program.options].filter(
    (opt) => opt !== undefined,
  );

  if (opts.length) {
    lines.push(makeHeader(`flags`));
    opts.forEach((opt) => {
      lines.push(
        concat([
          LEFT_PADDING,
          opt.flags,
          alignRight(opt.description, opt.flags.length),
        ]),
      );
    });
    lines.push("");
  }

  if (program.examples) {
    lines.push(makeHeader(`examples`));
    lines.push("  " + program.examples.trim());
    lines.push("");
  }
  lines.push("");

  return lines.join("\n");
}

const makeHeader = (text: string) => {
  return whiteBold(text.toLocaleUpperCase());
};

const makeLine = (cmd: Command) => {
  const args = cmd.registeredArguments
    .map((arg) => (arg.required ? required(arg.name()) : optional(arg.name())))
    .filter((arg) => arg !== "")
    .join(" ");

  const leftSide = concat([
    concat([
      cmd.parent && cmd.parent.parent ? cmd.parent?.name() : undefined,
      cmd.name(),
    ]),
    args,
    cmd.options.length ? optional("options") : "",
  ]);

  const rightSide = cmd.description() || red("TODO");

  const text = concat([
    LEFT_PADDING,
    leftSide,
    alignRight(rightSide, leftSide.length),
  ]);
  return cmd._debug ? yellow(text) : text;
};

const alignRight = (t: string, xIndex: number) => {
  return " ".repeat(Math.max(0, 45 - xIndex)) + t;
};

const required = (t: string) => ["<", t, ">"].join("");
const optional = (t: string) => ["[", t, "]"].join("");
const concat = (a: (string | undefined)[]) => a.filter(Boolean).join(" ");
