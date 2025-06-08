import { InstallerTarget } from "@director.run/client-configurator/index";
import { getInstaller } from "@director.run/client-configurator/index";
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
import { env } from "../../env";

export function registerConnectCommand(program: DirectorCommand) {
  program
    .command("connect <proxyId>")
    .description("connect a proxy to a MCP client")
    .addOption(
      makeOption({
        flags: "-t,--target <target>",
        description: "target client",
        choices: ["claude", "cursor", "vscode"],
      }),
    )
    .action(
      actionWithErrorHandler(
        async (proxyId: string, options: { target: InstallerTarget }) => {
          if (options.target) {
            const proxy = await gatewayClient.store.get.query({ proxyId });
            const installer = await getInstaller(options.target);
            const result = await installer.install({
              name: proxy.id,
              url: joinURL(env.GATEWAY_URL, getSSEPathForProxy(proxy.id)),
            });

            console.log(result);
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
            const baseUrl = env.GATEWAY_URL;
            const sseURL = joinURL(baseUrl, getSSEPathForProxy(proxy.id));
            const streamableURL = joinURL(
              baseUrl,
              getStreamablePathForProxy(proxy.id),
            );

            const stdioCommand = {
              command: "npx",
              args: ["-y", "@director.run/cli", "http2stdio", streamableURL],
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
