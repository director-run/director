import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import {
  actionWithErrorHandler,
  makeTable,
} from "@director.run/utilities/cli/index";
import { attributeTable } from "@director.run/utilities/cli/index";
import { clientStore } from "../client-store";

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
        const clients = await clientStore.toPlainObject();
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
            playbooks: client.playbooks.map((w) => w.id),
          }),
        );
      }),
    );

  command
    .debugCommand("reset-all")
    .description("Delete all servers from all clients")
    .action(
      actionWithErrorHandler(async () => {
        await clientStore.resetAll();
      }),
    );

  command
    .debugCommand("config <clientName>")
    .description("Open client config file")
    .action(
      actionWithErrorHandler(async (clientName: string) => {
        const client = clientStore.get(clientName);
        await client.openConfig();
      }),
    );

  command
    .debugCommand("ls")
    .description("Show a list of the clients")
    .action(
      actionWithErrorHandler(async () => {
        const clients = await clientStore.toPlainObject();
        const table = makeTable(["name", "installed", "playbooks"]);
        table.push(
          ...clients.map((client) => [
            client.name,
            client.installed,
            client.playbooks.length
              ? client.playbooks.map((w) => w.id).join(", ")
              : "--",
          ]),
        );
        console.log(table.toString());
      }),
    );
}
