import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import {
  actionWithErrorHandler,
  mandatoryOption,
} from "@director.run/utilities/cli/index";
import { gatewayClient } from "../client";

export function createClientCommand() {
  const command = new DirectorCommand("client").description(
    "Manage MCP client configuration JSON (claude, cursor)",
  );

  command
    .debugCommand("ls")
    .description("List servers in the client config")
    .addOption(targetOption)
    .action(
      actionWithErrorHandler(async (target: string) => {
        if (target === "claude") {
          const result = await gatewayClient.installer.claude.list.query();
          console.log(result);
        } else if (target === "cursor") {
          const result = await gatewayClient.installer.cursor.list.query();
          console.log(result);
        }
      }),
    );

  command
    .debugCommand("restart")
    .description("Restart the MCP client")
    .addOption(targetOption)
    .action(
      actionWithErrorHandler(async (options: { target: string }) => {
        if (options.target === "claude") {
          console.log(await gatewayClient.installer.claude.restart.mutate());
        } else if (options.target === "cursor") {
          console.log(await gatewayClient.installer.cursor.restart.mutate());
        }
      }),
    );

  command
    .debugCommand("reset")
    .description("Purge all claude MCP servers")
    .addOption(targetOption)
    .action(
      actionWithErrorHandler(async (options: { target: string }) => {
        if (options.target === "claude") {
          console.log(await gatewayClient.installer.claude.purge.mutate());
        } else if (options.target === "cursor") {
          console.log(await gatewayClient.installer.cursor.purge.mutate());
        }
      }),
    );

  command
    .debugCommand("config")
    .description("Open claude config file")
    .addOption(targetOption)
    .action(
      actionWithErrorHandler((options: { target: string }) => {
        if (options.target === "claude") {
          gatewayClient.installer.claude.config.query();
        } else if (options.target === "cursor") {
          gatewayClient.installer.cursor.config.query();
        }
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
