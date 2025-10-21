import {
  getSSEPathForPlaybook,
  getStreamablePathForPlaybook,
} from "@director.run/gateway/helpers";
import { blue, whiteBold } from "@director.run/utilities/cli/colors";
import {
  DirectorCommand,
  makeOption,
} from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { joinURL } from "@director.run/utilities/url";
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
            const playbook = await gatewayClient.store.get.query({
              playbookId: playbookId,
            });
            const baseUrl = getGatewayBaseUrl();
            const sseURL = joinURL(baseUrl, getSSEPathForPlaybook(playbook.id));
            const streamableURL = joinURL(
              baseUrl,
              getStreamablePathForPlaybook(playbook.id),
            );

            const stdioCommand = {
              command: "npx",
              args: [
                "-y",
                "@director.run/cli@latest",
                "http2stdio",
                streamableURL,
              ],
              env: {
                LOG_LEVEL: "silent",
              },
            };

            console.log(whiteBold("HTTP Streamable:") + " " + streamableURL);
            console.log(whiteBold("HTTP SSE:") + " " + sseURL);
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
