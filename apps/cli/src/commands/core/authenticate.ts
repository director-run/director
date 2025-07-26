import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { openUrl } from "@director.run/utilities/os";
import { gatewayClient } from "../../client";

export function registerAuthCommand(program: DirectorCommand) {
  program
    .command("auth <proxyId> <server>")
    .description("Authenticate a server")
    .action(
      actionWithErrorHandler(async (proxyId: string, serverName: string) => {
        const res = await gatewayClient.store.authenticate.query({
          proxyId,
          serverName,
        });
        if (res.result === "REDIRECT") {
          openUrl(res.redirectUrl);
        }
      }),
    );
}
