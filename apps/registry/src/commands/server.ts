import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { Command } from "commander";
import { env } from "../config";
import { Registry } from "../registry";

export function registerServerCommands() {
  const command = new Command("service");

  command
    .command("start")
    .description("Start the registry")
    .action(
      actionWithErrorHandler(async () => {
        await Registry.start({ port: env.REGISTRY_PORT });
      }),
    );

  return command;
}
