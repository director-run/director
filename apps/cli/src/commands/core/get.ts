import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { makeTable } from "@director.run/utilities/cli/index";
import { gatewayClient } from "../../client";

export function registerGetCommand(program: DirectorCommand) {
  program
    .command("get <proxyId>")
    .description("Show proxy details")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const proxy = await gatewayClient.store.get.query({ proxyId });

        if (!proxy) {
          console.error(`proxy ${proxyId} not found`);
          return;
        }

        console.log(`id=${proxy.id}`);
        console.log(`name=${proxy.name}`);

        const table = makeTable(["name", "type", "url/command", "status"]);
        table.push(
          ...proxy.targets.map((target) => [
            target.name,
            target.type,
            target.command,
            target.status,
          ]),
        );

        console.log(table.toString());
      }),
    );
}
