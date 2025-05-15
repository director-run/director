import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { isDevelopment } from "@director.run/utilities/env";
import { Command } from "commander";
import { gatewayClient } from "../client";
import { env } from "../config";

export function registerCursorCommands(program: Command) {
  program
    .command("cursor:ls")
    .description("List cursor MCP servers")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const result = await gatewayClient.installer.cursor.list.query();
        console.log(result);
      }),
    );

  program
    .command("cursor:install <proxyId>")
    .description("Install a proxy to cursor")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const result = await gatewayClient.installer.cursor.install.mutate({
          proxyId,
          baseUrl: env.GATEWAY_URL,
        });
        console.log(result);
      }),
    );

  program
    .command("cursor:uninstall <proxyId>")
    .description("Uninstall a proxy from cursor")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const result = await gatewayClient.installer.cursor.uninstall.mutate({
          proxyId,
        });
        console.log(result);
      }),
    );

  if (isDevelopment()) {
    program
      .command("cursor:purge")
      .description("Purge all cursor MCP servers")
      .action(
        actionWithErrorHandler(async () => {
          const result = await gatewayClient.installer.cursor.purge.mutate();
          console.log(result);
        }),
      );
  }
}
