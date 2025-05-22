import { ClaudeInstaller } from "@director.run/installer/claude";
import { isClaudeInstalled } from "@director.run/installer/claude";
import {
  CursorInstaller,
  isCursorInstalled,
} from "@director.run/installer/cursor";
import type { ProxyServer } from "@director.run/mcp/proxy-server";
import { getLogger } from "@director.run/utilities/logger";
import { REGISTRY_ENTRY_NAME_PREFIX } from "./config";

const logger = getLogger("gateway/helpers");

export function getPathForProxy(proxyId: string) {
  return `/${proxyId}/mcp`;
}

export async function restartConnectedClients(proxy: ProxyServer) {
  logger.info(`restarting connected clients for ${proxy.id}`);

  const proxyName = proxy.id.startsWith(REGISTRY_ENTRY_NAME_PREFIX)
    ? proxy.id.slice(REGISTRY_ENTRY_NAME_PREFIX.length)
    : proxy.id;

  if (isClaudeInstalled()) {
    logger.info(`claude is installed`);
    const claudeInstaller = await ClaudeInstaller.create();
    if (claudeInstaller.isInstalled(proxyName)) {
      logger.info(`${proxy.id} is intalled in claude, restarting...`);
      await claudeInstaller.restartClaude();
    } else {
      logger.info(`${proxy.id} is not installed in claude`);
    }
  }
  if (isCursorInstalled()) {
    logger.info(`cursor is installed`);
    const cursorInstaller = await CursorInstaller.create();
    if (cursorInstaller.isInstalled(proxyName)) {
      logger.info(`${proxy.id} is intalled in cursor`);
      await cursorInstaller.reload(proxyName);
    } else {
      logger.info(`${proxy.id} is not installed in cursor`);
    }
  }
}
