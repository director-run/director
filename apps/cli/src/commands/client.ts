import {
  type ClientName,
  getAllClientsAsPlainObject,
  getClient,
  resetAllClients,
} from "@director.run/client-configurator/index";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import {
  actionWithErrorHandler,
  makeTable,
} from "@director.run/utilities/cli/index";
import { attributeTable } from "@director.run/utilities/cli/index";

export function registerClientCommands(program: DirectorCommand): void {
  const command = new DirectorCommand("client").description(
    "Manage MCP client configuration JSON (claude, cursor, vscode)",
  );

  program.addCommand(command);

  command
    .debugCommand("get <clientName>")
    .description("get the details of a client")
    .action(
      actionWithErrorHandler(async (clientName: ClientName) => {
        const installer = await getClient(clientName);
        const servers = await installer.list();

        console.log(
          attributeTable({
            name: clientName,
            workspaces: servers.length
              ? servers.map((w) => w.name).join(", ")
              : "--",
            installed: (await installer.isClientPresent()) ? "yes" : "no",
            configExists: (await installer.isClientConfigPresent())
              ? "yes"
              : "no",
            configPath: installer.configPath,
          }),
        );
      }),
    );

  command
    .debugCommand("restart <clientName>")
    .description("Restart the MCP client")
    .action(
      actionWithErrorHandler(async (clientName: ClientName) => {
        const installer = await getClient(clientName);
        const result = await installer.restart();
        console.log(result);
      }),
    );

  command
    .debugCommand("reset <clientName>")
    .description("Delete all servers from the client config")
    .action(
      actionWithErrorHandler(async (clientName: ClientName) => {
        const installer = await getClient(clientName);
        const result = await installer.reset();
        if (result.requiresRestart) {
          console.log("Requires restart");
          await installer.restart();
        }
      }),
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
    .debugCommand("config <clientName>")
    .description("Open claude config file")
    .action(
      actionWithErrorHandler(async (clientName: ClientName) => {
        const installer = await getClient(clientName);
        const result = await installer.openConfig();
        console.log(result);
      }),
    );

  command
    .debugCommand("ls")
    .description("Show a list of the clients")
    .action(
      actionWithErrorHandler(async () => {
        const clients = await getAllClientsAsPlainObject();
        const table = makeTable(["name", "installed", "workspaces"]);
        table.push(
          ...clients.map((client) => [
            client.name,
            client.installed,
            client.workspaces.length
              ? client.workspaces.map((w) => w.id).join(", ")
              : "--",
          ]),
        );
        console.log(table.toString());
      }),
    );
}
