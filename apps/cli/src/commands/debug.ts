import { seed } from "@director.run/db/seed";
import { Command } from "commander";
import { withErrorHandler } from "../helpers";

export function registerDebugCommands(program: Command) {
  program
    .command("debug:seed")
    .description("Seed the database with test data, for development")
    .action(
      withErrorHandler(() => {
        seed();
      }),
    );

  program
    .command("debug:restart <client>")
    .description("Restart client")
    .action(
      withErrorHandler(() => {
        console.log("todo");
      }),
    );
}
