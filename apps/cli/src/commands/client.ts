import { Command } from "commander";
import { withErrorHandler } from "../helpers";
import { trpc } from "../trpc";

export function registerClientCommands(program: Command) {
  program
    .command("install <proxyId> <client>")
    .description("Install a proxy on a client app")
    .action(
      withErrorHandler(async (proxyId: string, client: InstallOptions) => {
        const result = await trpc.installer.install.mutate({
          proxyId,
          client,
        });
        console.log(result);
      }),
    );

  program
    .command("uninstall <proxyId> <client>")
    .description("Uninstall an proxy from a client app")
    .action(
      withErrorHandler(async (proxyId: string, client: InstallOptions) => {
        const result = await trpc.installer.uninstall.mutate({
          proxyId,
          client,
        });
        console.log(result);
      }),
    );
}

interface InstallOptions {
  client: "claude" | "cursor";
}
