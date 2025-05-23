import {
  actionWithErrorHandler,
} from "@director.run/utilities/cli";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { gatewayClient } from "../client";
import { env } from "../config";

export function createCursorCommands() {
  const command = new DirectorCommand("cursor").description(
    "Manage cursor MCP server configuration",
  );

  command
    .command("ls")
    .description("List cursor MCP servers")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const result = await gatewayClient.installer.cursor.list.query();
        console.log(result);
      }),
    );

  command
    .command("install <proxyId>")
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

  command
    .command("uninstall <proxyId>")
    .description("Uninstall a proxy from cursor")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const result = await gatewayClient.installer.cursor.uninstall.mutate({
          proxyId,
        });
        console.log(result);
      }),
    );

  command
    .debugCommand("restart")
    .description("Restart cursor")
    .action(
      actionWithErrorHandler(async () => {
        const result = await gatewayClient.installer.cursor.restart.mutate();
        console.log(result);
      }),
    );

  command
    .debugCommand("purge")
    .description("Purge all cursor MCP servers")
    .action(
      actionWithErrorHandler(async () => {
        const result = await gatewayClient.installer.cursor.purge.mutate();
        console.log(result);
      }),
    );

  command
    .debugCommand("config")
    .description("Open the cursor config file")
    .action(
      actionWithErrorHandler(() => {
        gatewayClient.installer.cursor.config.query();
      }),
    );

  return command;
}
