import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { openUrl } from "@director.run/utilities/os";
import { gatewayClient } from "../../client";

export function registerAuthCommand(program: DirectorCommand) {
  program
    .command("auth <playbookId> <server>")
    .description("Authenticate a server")
    .action(
      actionWithErrorHandler(async (playbookId: string, serverName: string) => {
        const res = await gatewayClient.store.authenticate.query({
          playbookId: playbookId,
          serverName,
        });
        if (res.result === "REDIRECT") {
          openUrl(res.redirectUrl);
        }
      }),
    );

  program
    .command("logout <playbookId> <serverName>")
    .description("Logout a server")
    .action(
      actionWithErrorHandler(async (playbookId: string, serverName: string) => {
        await gatewayClient.store.logout.mutate({
          playbookId: playbookId,
          serverName,
        });
      }),
    );
}
