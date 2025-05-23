import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { isDevelopment } from "@director.run/utilities/env";
import { Command } from "commander";
import { gatewayClient } from "../client";
import { env } from "../config";

export function createClaudeCommand() {
  const command = new Command("claude").description(
    "Manage claude MCP servers",
  );

  command
    .command("ls")
    .description("List claude MCP servers")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const result = await gatewayClient.installer.claude.list.query();
        console.log(result);
      }),
    );

  command
    .command("install <proxyId>")
    .description("Install a proxy on a client app")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const result = await gatewayClient.installer.claude.install.mutate({
          proxyId,
          baseUrl: env.GATEWAY_URL,
        });
        console.log(result);
      }),
    );

  command
    .command("uninstall <proxyId>")
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
    command
      .command("restart")
      .description("Restart the claude MCP server")
      .action(
        actionWithErrorHandler(async () => {
          const result = await gatewayClient.installer.claude.restart.mutate();
          console.log(result);
        }),
      );

    command
      .command("purge")
      .description("Purge all claude MCP servers")
      .action(
        actionWithErrorHandler(async () => {
          const result = await gatewayClient.installer.claude.purge.mutate();
          console.log(result);
        }),
      );

    command
      .command("config")
      .description("Open claude config file")
      .action(
        actionWithErrorHandler(() => {
          gatewayClient.installer.claude.config.query();
        }),
      );
  }

  return command;
}
