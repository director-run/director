import { TRPCClientError } from "@trpc/client";
import chalk from "chalk";
import Table from "cli-table3";
import { type CommandOptions, Option } from "commander";
import { Command, type HelpContext } from "commander";
import { isDevelopment } from "../env";
import ora from "ora";
import { blue, red } from "./colors";
import { makeHelpText } from "./help";



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