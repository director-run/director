import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { Command } from "commander";
import { seed } from "../db/seed";

export function registerDebugCommands(program: Command) {
  program
    .command("debug:seed")
    .description("Seed the database with test data, for development")
    .action(
      actionWithErrorHandler(() => {
        seed();
      }),
    );

  program
    .command("debug:restart <client>")
    .description("Restart client")
    .action(
      actionWithErrorHandler(() => {
        console.log("todo");
      }),
    );
}
