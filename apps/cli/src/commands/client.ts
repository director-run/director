import { Command } from "commander";
import { withErrorHandler } from "../helpers";
import { trpc } from "../trpc";

export function registerClientCommands(program: Command) {
  program
    .command("install <proxyId> <client>")
    .description("Install a proxy on a client app")
    // .addOption(
    //   mandatoryOption("-c, --client [type]", "client to install to").choices([
    //     "claude",
    //     "cursor",
    //   ]),
    // )
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
    .command("uninstall <proxyId> <client>")
    .description("Uninstall an proxy from a client app")
    // .addOption(
    //   mandatoryOption(
    //     "-c, --client [type]",
    //     "client to uninstall from",
    //   ).choices(["claude", "cursor"]),
    // )
    .action(
      withErrorHandler(async (proxyId: string, options: InstallOptions) => {
        const result = await trpc.installer.uninstall.mutate({
          proxyId,
          client: options.client,
        });
        console.log(result);
      }),
    );
}

interface InstallOptions {
  client: "claude" | "cursor";
}
