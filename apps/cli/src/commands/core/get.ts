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
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { makeTable } from "@director.run/utilities/cli/index";
import { joinURL } from "@director.run/utilities/url";
import { gatewayClient } from "../../client";
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

function printTargetDetails(
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
  } = target;

  console.log();
  console.log(whiteBold(`PROXIES > ${proxyId} > ${blue(name)}`));
  console.log();

  console.log(`${whiteBold("name")} = ${name}`);
  console.log(`${whiteBold("status")} = ${status}`);
  console.log(`${whiteBold("command")} = ${command}`);
  console.log(`${whiteBold("type")} = ${type}`);
  console.log(
    `${whiteBold("lastConnectedAt")} = ${lastConnectedAt?.toISOString() ?? "--"}`,
  );
  console.log(`${whiteBold("lastErrorMessage")} = ${lastErrorMessage ?? "--"}`);
  console.log();
  console.log(`${whiteBold("sourceName")} = ${source?.name}`);
  console.log(`${whiteBold("sourceId")} = ${source?.entryId}`);
}

export function printProxyDetails(proxy: GatewayRouterOutputs["store"]["get"]) {
  const { id, name, description, addToolPrefix, path } = proxy;
  console.log();
  console.log(whiteBold(`PROXIES > ${blue(name)}`));
  console.log();

  const sseURL = joinURL(env.GATEWAY_URL, getSSEPathForProxy(proxy.id));
  const streamableURL = joinURL(
    env.GATEWAY_URL,
    getStreamablePathForProxy(proxy.id),
  );

  console.log(`${whiteBold("id")} = ${id}`);
  console.log(`${whiteBold("name")} = ${name}`);
  console.log(`${whiteBold("description")} = ${description}`);
  console.log(`${whiteBold("addToolPrefix")} = ${addToolPrefix}`);
  console.log(`${whiteBold("streamableUrl")} = ${streamableURL}`);
  console.log(`${whiteBold("sseURL")} = ${sseURL}`);

  const table = makeTable([
    "name",
    "type",
    "url/command",
    "status",
    "lastConnectedAt",
    "lastErrorMessage",
  ]);
  table.push(
    ...proxy.targets.map((target) => [
      target.name,
      target.type,
      target.command,
      target.status === "connected" ? green(target.status) : red(target.status),
      target.lastConnectedAt?.toISOString() ?? "--",
      target.lastErrorMessage ?? "--",
    ]),
  );
  console.log();
  console.log(table.toString());
  console.log();
}
