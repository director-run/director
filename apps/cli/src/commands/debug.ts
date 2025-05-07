import { seed } from "@director.run/db/seed";
import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { Command } from "commander";

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
