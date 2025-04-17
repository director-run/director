import { Command } from "commander";
import { withErrorHandler } from "../helpers";
import { mandatoryOption } from "../helpers";
import { trpc } from "../trpc";

export function registerClientCommands(program: Command) {
  program
    .command("client:install <client> <proxyId>")
    .description("Install an mcp server to a client app")
    .addOption(
      mandatoryOption("-c, --client [type]", "client to install to").choices([
        "claude",
        "cursor",
      ]),
    )
    .action(
      withErrorHandler(async (proxyId: string, options: InstallOptions) => {
        const result = await trpc.installer.install.mutate({
          proxyId,
          client: options.client,
        });
        console.log(result);
      }),
    );

  program
    .command("client:uninstall <client> <proxyId>")
    .description("Uninstall an mcp server from a client app")
    .addOption(
      mandatoryOption(
        "-c, --client [type]",
        "client to uninstall from",
      ).choices(["claude", "cursor"]),
    )
    .action(
      withErrorHandler(async (proxyId: string, options: InstallOptions) => {
        const result = await trpc.installer.uninstall.mutate({
          proxyId,
          client: options.client,
        });
        console.log(result);
      }),
    );

  program
    .command("client:restart <client>")
    .description("Restart client")
    .action(
      withErrorHandler(async () => {
        console.log("todo");
      }),
    );
}

interface InstallOptions {
  client: "claude" | "cursor";
}
