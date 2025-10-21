import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { spinnerWrap } from "@director.run/utilities/cli/loader";
import { gatewayClient } from "../../client";

export function registerRemoveCommand(program: DirectorCommand) {
  return program
    .command("remove <playbookId> <serverName>")
    .description("Remove a server from a playbook")
    .action(
      actionWithErrorHandler(async (playbookId: string, serverName: string) => {
        await spinnerWrap(() =>
          gatewayClient.store.removeServer.mutate({
            playbookId: playbookId,
            serverName,
          }),
        )
          .start("removing server...")
          .succeed(`Server ${serverName} removed from ${playbookId}`)
          .run();
      }),
    );
}
