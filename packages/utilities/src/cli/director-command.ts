import { Option, type CommandOptions } from "commander";
import { Command, type HelpContext } from "commander";
import { isDevelopment } from "../env";
import { makeHelpText } from "./help";

declare module "commander" {
  interface Command {
    _debug?: boolean; // is it a debug command?
    _helpOption?: Option;
  }
}

export class DirectorCommand extends Command {
  public debug = true;
  public examples = "";

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
    return makeHelpText(this);
  }

  addExamples(examples: string) {
    this.examples = examples;
  }
}
