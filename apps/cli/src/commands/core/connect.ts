import { blue, whiteBold } from "@director.run/utilities/cli/colors";
import {
  DirectorCommand,
  makeOption,
} from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { gatewayClient } from "../../client";
import { getGatewayBaseUrl } from "../../config";

export function registerConnectCommand(program: DirectorCommand) {
  program
    .command("connect <playbookId>")
    .description("Connect a playbook to a MCP client")
    .addOption(
      makeOption({
        flags: "-t,--target <target>",
        description: "target client",
      }),
    )
    .action(
      actionWithErrorHandler(
        async (playbookId: string, options: { target: string }) => {
          if (options.target) {
            const playbook = await gatewayClient.store.get.query({
              playbookId: playbookId,
            });
            await gatewayClient.clients.install.mutate({
              clientId: options.target,
              playbookId: playbook.id,
              baseUrl: getGatewayBaseUrl(),
            });
          } else {
            console.log();
            console.log(blue("--------------------------------"));
            console.log(blue(`Connection Details for '${playbookId}'`));
            console.log(blue("--------------------------------"));
            console.log();
            console.log(
              "Note: if you'd like to connect to a client automatically, run:",
            );
            console.log(
              "director connect " + playbookId + " --target <target>",
            );
            console.log();

            // Get connection info from gateway (includes API key)
            const connectionInfo =
              await gatewayClient.store.getConnectionInfo.query({
                playbookId,
              });

            console.log(
              whiteBold("HTTP Streamable:") +
                " " +
                connectionInfo.streamableUrl,
            );
            console.log(whiteBold("HTTP SSE:") + " " + connectionInfo.sseUrl);
            console.log(
              whiteBold("Stdio:"),
              JSON.stringify(connectionInfo.stdioCommand, null, 2),
            );
            console.log();
          }
        },
      ),
    );
}
