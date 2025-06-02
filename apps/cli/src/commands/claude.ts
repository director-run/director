import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import {
  actionWithErrorHandler,
  mandatoryOption,
} from "@director.run/utilities/cli/index";
import { gatewayClient } from "../client";
import { env } from "../config";

export function createClientCommand() {
  const command = new DirectorCommand("client").description(
    "Manage MCP client configuration JSON (claude, cursor)",
  );

  command
    .command("ls")
    .description("List servers in the client config")
    .addOption(targetOption)
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const result = await gatewayClient.installer.claude.list.query();
        console.log(result);
      }),
    );

  command
    .command("install <proxyId>")
    .description("Install a proxy on a client app")
    .addOption(targetOption)
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
    .addOption(targetOption)
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const result = await gatewayClient.installer.claude.uninstall.mutate({
          proxyId,
        });
        console.log(result);
      }),
    );

  command
    .debugCommand("restart")
    .description("Restart the claude MCP server")
    .addOption(targetOption)
    .action(
      actionWithErrorHandler(async () => {
        const result = await gatewayClient.installer.claude.restart.mutate();
        console.log(result);
      }),
    );

  command
    .debugCommand("reset")
    .description("Purge all claude MCP servers")
    .addOption(targetOption)
    .action(
      actionWithErrorHandler(async () => {
        const result = await gatewayClient.installer.claude.purge.mutate();
        console.log(result);
      }),
    );

  command
    .debugCommand("config")
    .description("Open claude config file")
    .addOption(targetOption)
    .action(
      actionWithErrorHandler(() => {
        gatewayClient.installer.claude.config.query();
      }),
    );

  return command;
}

// If option not provided prompt user for a choice
const targetOption = mandatoryOption(
  "-t,--target <target>",
  "target client",
  undefined,
  ["claude", "cursor"],
);
