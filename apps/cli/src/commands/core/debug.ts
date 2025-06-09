import { resetAllClients } from "@director.run/client-configurator/index";
import { SimpleClient } from "@director.run/mcp/simple-client";
import { whiteBold } from "@director.run/utilities/cli/colors";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { joinURL } from "@director.run/utilities/url";
import { gatewayClient } from "../../client";
import { env } from "../../env";

export function registerDebugCommands(program: DirectorCommand) {
  program
    .debugCommand("test-proxy <proxyId>")
    .description("Run a high level test of a proxy")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const client = new SimpleClient("proxy-test-client");
        await client.connectToHTTP(joinURL(env.GATEWAY_URL, `${proxyId}/mcp`));
        const { tools } = await client.listTools();

        console.log();
        console.log(whiteBold("TOOLS"));
        console.log();

        console.log(tools.map((tool) => tool.name).join("\n"));
        console.log();

        await client.close();
      }),
    );

  program
    .debugCommand("reset")
    .description("Delete proxies, clear the config file, and reset all clients")
    .action(
      actionWithErrorHandler(async ({ target }) => {
        console.log("resetting service");
        await gatewayClient.store.purge.mutate();
        console.log("resetting clients");
        await resetAllClients();
      }),
    );
}
