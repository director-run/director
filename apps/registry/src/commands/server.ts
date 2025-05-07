import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { Command } from "commander";

export function registerServerCommands(program: Command) {
  program
    .command("server:start")
    .description("Start the server")
    .action(
      actionWithErrorHandler(async () => {
        await console.log("TODO");
      }),
    );
}
