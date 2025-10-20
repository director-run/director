import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { gatewayClient } from "../../client";

export function registerDebugCommands(program: DirectorCommand) {
  program
    .debugCommand("reset")
    .description(
      "Delete playbooks, clear the config file, and reset all clients",
    )
    .action(
      actionWithErrorHandler(async () => {
        console.log("resetting service");
        await gatewayClient.store.purge.mutate();
        console.log("resetting clients");
        await gatewayClient.clients.resetAll.mutate();
      }),
    );
}
