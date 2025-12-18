import { type ClientId } from "@director.run/client-configurator/client-store";
import { blue, whiteBold } from "@director.run/utilities/cli/colors";
import {
  DirectorCommand,
  makeOption,
} from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { gatewayClient } from "../../client";
import { clientStore } from "../../client-store";

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
          // Get connection info from gateway (key returned separately)
          const connectionInfo =
            await gatewayClient.store.getConnectionInfo.query({
              playbookId,
            });

          // Build full URL with API key
          const streamableUrlWithKey = `${connectionInfo.streamableUrl}?key=${connectionInfo.apiKey}`;

          // Build stdio command config
          const stdioCommand = {
            command: "npx",
            args: [
              "-y",
              "@director.run/cli@latest",
              "http2stdio",
              streamableUrlWithKey,
            ],
            env: {
              LOG_LEVEL: "silent",
            },
          };

          if (options.target) {
            // Install directly using client configurator
            await clientStore.install({
              clientId: options.target as ClientId,
              name: connectionInfo.playbookId,
              connectionDetails: {
                streamableUrl: streamableUrlWithKey,
              },
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
            console.log(
              whiteBold("HTTP Streamable:") + " " + streamableUrlWithKey,
            );
            console.log(
              whiteBold("Stdio:"),
              JSON.stringify(stdioCommand, null, 2),
            );
            console.log();
          }
        },
      ),
    );
}
