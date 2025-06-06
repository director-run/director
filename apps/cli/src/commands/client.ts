import {
  DirectorCommand,
  makeOption,
} from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { isDevelopment } from "@director.run/utilities/env";
import { gatewayClient } from "../client";

export function registerClientCommands(program: DirectorCommand): void {
  if (!isDevelopment()) {
    // Only show client commands in development
    return;
  }

  const command = new DirectorCommand("client").description(
    "Manage MCP client configuration JSON (claude, cursor, vscode)",
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
        } else if (target === "vscode") {
          const result = await gatewayClient.installer.vscode.list.query();
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
        } else if (options.target === "vscode") {
          console.log(await gatewayClient.installer.vscode.restart.mutate());
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
        } else if (options.target === "vscode") {
          console.log(await gatewayClient.installer.vscode.purge.mutate());
        }
      }),
    );

  command
    .debugCommand("config")
    .description("Open claude config file")
    .addOption(targetOption)
    .action(
      actionWithErrorHandler(async (options: { target: string }) => {
        if (options.target === "claude") {
          await gatewayClient.installer.claude.config.query();
        } else if (options.target === "cursor") {
          await gatewayClient.installer.cursor.config.query();
        } else if (options.target === "vscode") {
          await gatewayClient.installer.vscode.config.query();
        }
      }),
    );

  program.addCommand(command);
}

// If option not provided prompt user for a choice
const targetOption = makeOption({
  flags: "-t,--target <target>",
  description: "target client",
  choices: ["claude", "cursor", "vscode"],
  mandatory: true,
});
