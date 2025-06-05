import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { spinnerWrap } from "@director.run/utilities/cli/loader";
import { gatewayClient } from "../../client";

export function registerRemoveCommand(program: DirectorCommand) {
  return program
    .command("remove <proxyId> <serverName>")
    .description("Remove a server from a proxy")
    .action(
      actionWithErrorHandler(async (proxyId: string, serverName: string) => {
        const proxy = await spinnerWrap(() =>
          gatewayClient.store.removeServer.mutate({
            proxyId,
            serverName,
          }),
        )
          .start("removing server...")
          .succeed(`Server ${serverName} removed from ${proxyId}`)
          .run();
      }),
    );
}
