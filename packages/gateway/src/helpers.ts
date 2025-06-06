import { ClaudeInstaller } from "@director.run/client-manager/claude";
import { isClaudeInstalled } from "@director.run/client-manager/claude";
import {
  CursorInstaller,
  isCursorInstalled,
} from "@director.run/client-manager/cursor";
import type { ProxyServer } from "@director.run/mcp/proxy-server";
import { getLogger } from "@director.run/utilities/logger";

const logger = getLogger("gateway/helpers");

export function getStreamablePathForProxy(proxyId: string) {
  return `/${proxyId}/mcp`;
}

export function getSSEPathForProxy(proxyId: string) {
  return `/${proxyId}/sse`;
}

export async function restartConnectedClients(proxy: ProxyServer) {
  logger.info(`restarting connected clients for ${proxy.id}`);

  if (isClaudeInstalled()) {
    logger.info(`claude is installed`);
    const claudeInstaller = await ClaudeInstaller.create();
    if (claudeInstaller.isInstalled(proxy.id)) {
      logger.info(`${proxy.id} is intalled in claude, restarting...`);
      await claudeInstaller.restart();
    } else {
      logger.info(`${proxy.id} is not installed in claude`);
    }
  }
  if (isCursorInstalled()) {
    logger.info(`cursor is installed`);
    const cursorInstaller = await CursorInstaller.create();
    if (cursorInstaller.isInstalled(proxy.id)) {
      logger.info(`${proxy.id} is intalled in cursor`);
      await cursorInstaller.reload(proxy.id);
    } else {
      logger.info(`${proxy.id} is not installed in cursor`);
    }
  }
}
