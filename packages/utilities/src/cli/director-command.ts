import { type CommandOptions, Option } from "commander";
import { Command, type HelpContext } from "commander";
import { makeHelpText } from "./help";

declare module "commander" {
  interface Command {
    _debug?: boolean; // is this command a debug command?
    _helpOption?: Option;
    _enableDebugCommands?: boolean; // should enable debug commands?
  }
}

export class DirectorCommand extends Command {
  public debug = true;
  public examples = "";

  constructor(name?: string) {
    super(name);
    this.helpCommand(false);
  }

  showDebugCommands(showDebugCommands: boolean) {
    this._enableDebugCommands = showDebugCommands;
    return this;
  }

  debugCommand(nameAndArgs: string, opts?: CommandOptions) {
    if (this._enableDebugCommands) {
      const command = super.command(nameAndArgs, opts);
      command._enableDebugCommands = true;
      command._debug = true;
      return command;
    } else {
      return new Command(nameAndArgs);
    }
  }

  helpInformation(context?: HelpContext): string {
    return makeHelpText(this);
  }

  addExamples(examples: string) {
    this.examples = examples;
  }

  addCommand(cmd: DirectorCommand, opts?: CommandOptions) {
    cmd._enableDebugCommands = this._enableDebugCommands;
    cmd._debug = this._debug;
    return super.addCommand(cmd, opts);
  }
}

export function makeOption({
  flags,
  description,
  defaultValue,
  choices,
  mandatory,
}: {
  flags: string;
  description?: string;
  defaultValue?: string;
  choices?: string[];
  mandatory?: boolean;
}) {
  const option = new Option(flags, description);
  mandatory && option.makeOptionMandatory();
  defaultValue && option.default(defaultValue);
  choices && option.choices(choices);
  return option;
}
