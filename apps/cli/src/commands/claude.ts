import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { Command } from "commander";
import { gatewayClient } from "../client";

export function registerClaudeCommands(program: Command) {
  program
    .command("claude ls")
    .description("List claude MCP servers")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const result = await gatewayClient.installer.claude.list.query();
        console.log(result);
      }),
    );

  program
    .command("claude install <proxyId>")
    .description("Install a proxy on a client app")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const result = await gatewayClient.installer.claude.install.mutate({
          proxyId,
        });
        console.log(result);
      }),
    );

  program
    .command("claude uninstall <proxyId>")
    .description("Uninstall an proxy from a client app")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const result = await gatewayClient.installer.claude.uninstall.mutate({
          proxyId,
        });
        console.log(result);
      }),
    );
}
