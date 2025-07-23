import type { GatewayRouterOutputs } from "@director.run/gateway/client";
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
    .command("get <proxyId>")
    .description("Show proxy details")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const proxy = await gatewayClient.store.get.query({ proxyId });

        if (!proxy) {
          console.error(`proxy ${proxyId} not found`);
          return;
        }

        printProxyDetails(proxy);
      }),
    );
}

function printProxyDetails(proxy: GatewayRouterOutputs["store"]["get"]) {
  const { id, name, description, addToolPrefix, path } = proxy;
  console.log();
  console.log(whiteBold(`PROXIES > ${blue(name)}`));
  console.log();

  console.log(`${whiteBold("id")} = ${id}`);
  console.log(`${whiteBold("name")} = ${name}`);
  console.log(`${whiteBold("description")} = ${description}`);
  console.log(`${whiteBold("addToolPreix")} = ${addToolPrefix}`);
  console.log(`${whiteBold("path")} = ${joinURL(env.GATEWAY_URL, path)}`);

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
