import type { GatewayRouterOutputs } from "@director.run/gateway/client";
import { getSSEPathForProxy } from "@director.run/gateway/helpers";
import { getStreamablePathForProxy } from "@director.run/gateway/helpers";
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

export function registerGetCommand(program: DirectorCommand) {
  program
    .command("get <proxyId> [serverName]")
    .description("Show proxy details")
    .action(
      actionWithErrorHandler(async (proxyId: string, serverName?: string) => {
        if (serverName) {
          const target = await gatewayClient.store.getServer.query({
            proxyId,
            serverName,
          });
          printTargetDetails(proxyId, target);
        } else {
          const proxy = await gatewayClient.store.get.query({ proxyId });

          if (!proxy) {
            console.error(`proxy ${proxyId} not found`);
            return;
          }

          printProxyDetails(proxy);
        }
      }),
    );
}

export function printTargetDetails(
  proxyId: string,
  target: GatewayRouterOutputs["store"]["getServer"],
) {
  const {
    name,
    status,
    command,
    type,
    lastConnectedAt,
    lastErrorMessage,
    source,
    toolPrefix,
    disabledTools,
  } = target;

  console.log();
  console.log(whiteBold(`PROXIES > ${proxyId} > ${blue(name)}`));
  console.log();

  console.log(
    attributeTable({
      name,
      status: targetStatus(status),
      command,
      type,
      lastConnectedAt: lastConnectedAt?.toISOString() ?? "--",
      lastErrorMessage: lastErrorMessage ?? "--",
      sourceName: source?.name ?? "--",
      sourceId: source?.entryId ?? "--",
      toolPrefix: toolPrefix ?? "--",
      disabledTools: disabledTools ?? "--",
    }),
  );
  console.log();
}

export function printProxyDetails(proxy: GatewayRouterOutputs["store"]["get"]) {
  const { id, name, description } = proxy;
  console.log();
  console.log(whiteBold(`PROXIES > ${blue(name)}`));
  console.log();

  console.log(
    attributeTable({
      id,
      name,
      description: description ?? "--",
      streamableURL: joinURL(
        env.GATEWAY_URL,
        getStreamablePathForProxy(proxy.id),
      ),
      sseURL: joinURL(env.GATEWAY_URL, getSSEPathForProxy(proxy.id)),
    }),
  );

  console.log();
  console.log(subtitle(`targets`));
  console.log();

  const table = makeTable([
    "name",
    "type",
    // "url/command",
    "status",
    "lastConnectedAt",
    "lastErrorMessage",
  ]);
  table.push(
    ...proxy.targets.map((target) => [
      target.name,
      target.type,
      // target.command,
      targetStatus(target.status),
      target.lastConnectedAt?.toISOString() ?? "--",
      target.lastErrorMessage ?? "--",
    ]),
  );
  console.log(table.toString());
  console.log();
}

function targetStatus(status: string) {
  return status === "connected" ? green(status) : red(status);
}
