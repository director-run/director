import type { GatewayRouterOutputs } from "@director.run/gateway/client";
import {
  blue,
  green,
  red,
  whiteBold,
} from "@director.run/utilities/cli/colors";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import {
  actionWithErrorHandler,
  attributeTable,
} from "@director.run/utilities/cli/index";
import { makeTable } from "@director.run/utilities/cli/index";
import { joinURL } from "@director.run/utilities/url";
import { gatewayClient } from "../../client";
import { subtitle } from "../../common";
import { env } from "../../env";
import { listPrompts } from "../../views/prompts-list";
import { makeToolTable } from "../mcp/tools";

export function registerGetCommand(program: DirectorCommand) {
  program
    .command("get <playbookId> [serverName]")
    .description("Show playbook details")
    .action(
      actionWithErrorHandler(
        async (playbookId: string, serverName?: string) => {
          if (serverName) {
            const target = await gatewayClient.store.getServer.query({
              playbookId: playbookId,
              serverName,
              queryParams: { includeTools: true },
            });
            printTargetDetails(playbookId, target);
          } else {
            const playbook = await gatewayClient.store.get.query({
              playbookId: playbookId,
              queryParams: {
                includeInMemoryTargets: true,
              },
            });

            if (!playbook) {
              console.error(`playbook ${playbookId} not found`);
              return;
            }

            printPlaybookDetails(playbook);
          }
        },
      ),
    );
}

export function printTargetDetails(
  playbookId: string,
  target: GatewayRouterOutputs["store"]["getServer"],
) {
  const { name, type, connectionInfo, source, tools, disabled, toolsList } =
    target;

  console.log();
  console.log(whiteBold(`PLAYBOOKS > ${playbookId} > ${blue(name)}`));
  console.log();

  let transport = {};
  if (type === "http") {
    transport = { url: target.url, headers: target.headers };
  } else if (type === "stdio") {
    transport = { command: target.command, args: target.args, env: target.env };
  }

  console.log(
    attributeTable({
      name,
      status: targetStatus(connectionInfo?.status ?? "--"),
      type: type,
      transport: JSON.stringify(transport, null, 2),
      lastConnectedAt: connectionInfo?.lastConnectedAt?.toISOString() ?? "--",
      lastErrorMessage: connectionInfo?.lastErrorMessage ?? "--",
      sourceName: source?.name ?? "--",
      sourceId: source?.entryId ?? "--",
      toolsPrefix: tools?.prefix ?? "''",
      toolsInclude: tools?.include ? JSON.stringify(tools.include) : "[]",
      toolsExclude: tools?.exclude ? JSON.stringify(tools.exclude) : "[]",
      disabled: disabled ? "yes" : "no",
    }),
  );
  console.log();

  if (toolsList) {
    console.log(subtitle(`tools`));
    console.log();
    console.log(makeToolTable(toolsList).toString());
    console.log();
  }
}

export function printPlaybookDetails(
  playbook: GatewayRouterOutputs["store"]["get"],
) {
  const { id, name, description, prompts } = playbook;
  console.log();
  console.log(whiteBold(`PLAYBOOKS > ${blue(name)}`));
  console.log();

  console.log(
    attributeTable({
      id,
      name,
      description: description ?? "--",
      streamableURL: joinURL(env.GATEWAY_URL, playbook.paths.streamable),
    }),
  );

  console.log();
  console.log(subtitle(`targets`));
  console.log();

  const table = makeTable([
    "name",
    "type",
    "status",
    "lastConnectedAt",
    "lastErrorMessage",
  ]);
  table.push(
    ...playbook.servers.map((target) => [
      target.name,
      target.type,
      targetStatus(target.connectionInfo?.status ?? "--"),
      target.connectionInfo?.lastConnectedAt?.toISOString() ?? "--",
      target.connectionInfo?.lastErrorMessage ?? "--",
    ]),
  );
  console.log(table.toString());

  console.log();
  console.log(subtitle(`prompts`));
  console.log();

  listPrompts(prompts);
}

function targetStatus(status: string) {
  return status === "connected" ? green(status) : red(status);
}
