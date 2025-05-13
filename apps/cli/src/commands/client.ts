import { createGatewayClient } from "@director.run/gateway/trpc/client";
import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { Command } from "commander";
import { env } from "../config";

const trpc = createGatewayClient(env.GATEWAY_URL);

export function registerClientCommands(program: Command) {
  program
    .command("install <proxyId> <client>")
    .description("Install a proxy on a client app")
    .action(
      actionWithErrorHandler(
        async (proxyId: string, client: InstallOptions) => {
          const result = await trpc.installer.install.mutate({
            proxyId,
            client,
          });
          console.log(result);
        },
      ),
    );

  program
    .command("uninstall <proxyId> <client>")
    .description("Uninstall an proxy from a client app")
    .action(
      actionWithErrorHandler(
        async (proxyId: string, client: InstallOptions) => {
          const result = await trpc.installer.uninstall.mutate({
            proxyId,
            client,
          });
          console.log(result);
        },
      ),
    );
}

type InstallOptions = "claude" | "cursor";
