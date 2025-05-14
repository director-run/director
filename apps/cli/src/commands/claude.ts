import path from "node:path";
import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { isDevelopment } from "@director.run/utilities/env";
import { Command } from "commander";
import { gatewayClient } from "../client";
import { env } from "../config";

export function registerClaudeCommands(program: Command) {
  program
    .command("claude:ls")
    .description("List claude MCP servers")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const result = await gatewayClient.installer.claude.list.query();
        console.log(result);
      }),
    );

  program
    .command("claude:install <proxyId>")
    .description("Install a proxy on a client app")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const result = await gatewayClient.installer.claude.install.mutate({
          proxyId,
          baseUrl: env.GATEWAY_URL,
          cliPath: path.join(__dirname, "../../bin/cli.ts"),
        });
        console.log(result);
      }),
    );

  program
    .command("claude:uninstall <proxyId>")
    .description("Uninstall an proxy from a client app")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const result = await gatewayClient.installer.claude.uninstall.mutate({
          proxyId,
        });
        console.log(result);
      }),
    );

  if (isDevelopment()) {
    program
      .command("claude:restart")
      .description("Restart the claude MCP server")
      .action(
        actionWithErrorHandler(async () => {
          const result = await gatewayClient.installer.claude.restart.mutate();
          console.log(result);
        }),
      );

    program
      .command("claude:purge")
      .description("Purge all claude MCP servers")
      .action(
        actionWithErrorHandler(async () => {
          const result = await gatewayClient.installer.claude.purge.mutate();
          console.log(result);
        }),
      );
  }
}
