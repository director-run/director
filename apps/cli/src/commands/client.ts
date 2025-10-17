import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import {
  actionWithErrorHandler,
  makeTable,
} from "@director.run/utilities/cli/index";
import { attributeTable } from "@director.run/utilities/cli/index";
import { gatewayClient } from "../client";

export function registerClientCommands(program: DirectorCommand): void {
  const command = new DirectorCommand("client").description(
    "Manage MCP client configuration JSON (claude, cursor, vscode)",
  );

  program.addCommand(command);

  command
    .debugCommand("get <clientName>")
    .description("get the details of a client")
    .action(
      actionWithErrorHandler(async (clientName: string) => {
        const clients = await gatewayClient.clients.allClients.query();
        const client = clients.find((c) => c.name === clientName);
        if (!client) {
          console.log(`client '${clientName}' not found`);
          return;
        }
        console.log(
          attributeTable({
            name: client.name,
            installed: client.installed,
            configExists: client.configExists,
            configPath: client.configPath,
            workspaces: client.workspaces.map((w) => w.id),
          }),
        );
      }),
    );

  // command
  //   .debugCommand("restart <clientName>")
  //   .description("Restart the MCP client")
  //   .action(
  //     actionWithErrorHandler(async (_clientName: string) => {
  //       // No-op: restart is handled by the gateway when needed during install/uninstall
  //       console.log("restart handled automatically during install/uninstall");
  //       await Promise.resolve();
  //     }),
  //   );

  // command
  //   .debugCommand("reset <clientName>")
  //   .description("Delete all servers from the client config")
  //   .action(
  //     actionWithErrorHandler(async (_clientName: string) => {
  //       // Not supported via router; use reset-all or connect/disconnect per proxy
  //       console.log(
  //         "Reset per-client is not supported via router. Use reset-all instead.",
  //       );
  //       await Promise.resolve();
  //     }),
  //   );

  command
    .debugCommand("reset-all")
    .description("Delete all servers from all clients")
    .action(
      actionWithErrorHandler(async () => {
        await gatewayClient.clients.resetAll.mutate();
      }),
    );

  command
    .debugCommand("config <clientName>")
    .description("Open claude config file")
    .action(
      actionWithErrorHandler(async (_clientName: string) => {
        console.log(
          "Opening client config is not supported via router from CLI.",
        );
        await Promise.resolve();
      }),
    );

  command
    .debugCommand("ls")
    .description("Show a list of the clients")
    .action(
      actionWithErrorHandler(async () => {
        const clients = await gatewayClient.clients.allClients.query();
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
