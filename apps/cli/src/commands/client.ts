import {
  ConfiguratorTarget,
  allClientStatuses,
  getConfigurator,
  resetAllClients,
} from "@director.run/client-configurator/index";
import {
  DirectorCommand,
  makeOption,
} from "@director.run/utilities/cli/director-command";
import {
  actionWithErrorHandler,
  makeTable,
} from "@director.run/utilities/cli/index";

export function registerClientCommands(program: DirectorCommand): void {
  const command = new DirectorCommand("client").description(
    "Manage MCP client configuration JSON (claude, cursor, vscode)",
  );

  program.addCommand(command);

  command
    .debugCommand("ls")
    .alias("list")
    .description("List servers in the client config")
    .addOption(targetOption)
    .action(
      actionWithErrorHandler(
        async (options: { target: ConfiguratorTarget }) => {
          const installer = await getConfigurator(options.target);
          const servers = await installer.list();
          const table = makeTable(["name", "url"]);

          table.push(
            ...servers.map((server) => [server.name, server.url || "--"]),
          );
          console.log(table.toString());
        },
      ),
    );

  command
    .debugCommand("restart")
    .description("Restart the MCP client")
    .addOption(targetOption)
    .action(
      actionWithErrorHandler(
        async (options: { target: ConfiguratorTarget }) => {
          const installer = await getConfigurator(options.target);
          const result = await installer.restart();
          console.log(result);
        },
      ),
    );

  command
    .debugCommand("reset")
    .description("Delete all servers from the client config")
    .addOption(targetOption)
    .action(
      actionWithErrorHandler(
        async (options: { target: ConfiguratorTarget }) => {
          const installer = await getConfigurator(options.target);
          const result = await installer.reset();
          console.log(result);
        },
      ),
    );

  command
    .debugCommand("reset-all")
    .description("Delete all servers from all clients")
    .action(
      actionWithErrorHandler(async () => {
        await resetAllClients();
      }),
    );

  command
    .debugCommand("config")
    .description("Open claude config file")
    .addOption(targetOption)
    .action(
      actionWithErrorHandler(
        async (options: { target: ConfiguratorTarget }) => {
          const installer = await getConfigurator(options.target);
          const result = await installer.openConfig();
          console.log(result);
        },
      ),
    );

  command
    .debugCommand("all-clients")
    .description("Show a list of the clients")
    .action(
      actionWithErrorHandler(async () => {
        const clients = await allClientStatuses();
        console.log(clients);
      }),
    );
}

// If option not provided prompt user for a choice
const targetOption = makeOption({
  flags: "-t,--target <target>",
  description: "target client",
  choices: ["claude", "cursor", "vscode"],
  mandatory: true,
});
