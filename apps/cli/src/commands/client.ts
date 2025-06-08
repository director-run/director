import {
  InstallerTarget,
  getInstaller,
} from "@director.run/client-configurator/get-installer";
import {
  DirectorCommand,
  makeOption,
} from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { isDevelopment } from "@director.run/utilities/env";

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
      actionWithErrorHandler(async (options: { target: InstallerTarget }) => {
        const installer = await getInstaller(options.target);
        const result = await installer.list();
        console.log(result);
      }),
    );

  command
    .debugCommand("restart")
    .description("Restart the MCP client")
    .addOption(targetOption)
    .action(
      actionWithErrorHandler(async (options: { target: InstallerTarget }) => {
        const installer = await getInstaller(options.target);
        const result = await installer.restart();
        console.log(result);
      }),
    );

  command
    .debugCommand("reset")
    .description("Purge all claude MCP servers")
    .addOption(targetOption)
    .action(
      actionWithErrorHandler(async (options: { target: InstallerTarget }) => {
        const installer = await getInstaller(options.target);
        const result = await installer.purge();
        console.log(result);
      }),
    );

  command
    .debugCommand("config")
    .description("Open claude config file")
    .addOption(targetOption)
    .action(
      actionWithErrorHandler(async (options: { target: InstallerTarget }) => {
        const installer = await getInstaller(options.target);
        const result = await installer.openConfig();
        console.log(result);
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
