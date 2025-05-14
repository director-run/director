import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { Command } from "commander";
import { env } from "../config";
import { Registry } from "../server";

export function registerServerCommands(program: Command) {
  program
    .command("server:start")
    .description("Start the server")
    .action(
      actionWithErrorHandler(async () => {
        await Registry.start({ port: env.REGISTRY_PORT });
      }),
    );
}
