import {
  allTargets,
  getConfigurator,
} from "@director.run/client-configurator/index";
import { getLogger } from "@director.run/utilities/logger";
import { Workspace } from "./workspaces/workspace";

const logger = getLogger("gateway/helpers");

export function getStreamablePathForProxy(proxyId: string) {
  return `/${proxyId}/mcp`;
}

export function getSSEPathForProxy(proxyId: string) {
  return `/${proxyId}/sse`;
}

export async function restartConnectedClients(proxy: Workspace) {
  logger.info(`restarting connected clients for ${proxy.name}`);

  for (const target of allTargets()) {
    const configurator = getConfigurator(target);
    if (await configurator.isInstalled(proxy.id)) {
      logger.info(`${proxy.id} is intalled in ${target}, restarting...`);
      await configurator.restart();
    }
  }
}
