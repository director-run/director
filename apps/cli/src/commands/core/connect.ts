import {
  getSSEPathForProxy,
  getStreamablePathForProxy,
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
    .command("connect <proxyId>")
    .description("Connect a proxy to a MCP client")
    .addOption(
      makeOption({
        flags: "-t,--target <target>",
        description: "target client",
      }),
    )
    .action(
      actionWithErrorHandler(
        async (proxyId: string, options: { target: string }) => {
          if (options.target) {
            const proxy = await gatewayClient.store.get.query({ proxyId });
            await gatewayClient.clients.install.mutate({
              clientId: options.target,
              workspaceId: proxy.id,
              baseUrl: getGatewayBaseUrl(),
            });
          } else {
            console.log();
            console.log(blue("--------------------------------"));
            console.log(blue(`Connection Details for '${proxyId}'`));
            console.log(blue("--------------------------------"));
            console.log();
            console.log(
              "Note: if you'd like to connect to a client automatically, run:",
            );
            console.log("director connect " + proxyId + " --target <target>");
            console.log();
            const proxy = await gatewayClient.store.get.query({ proxyId });
            const baseUrl = getGatewayBaseUrl();
            const sseURL = joinURL(baseUrl, getSSEPathForProxy(proxy.id));
            const streamableURL = joinURL(
              baseUrl,
              getStreamablePathForProxy(proxy.id),
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
