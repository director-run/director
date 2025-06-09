import { ClaudeInstaller } from "@director.run/client-configurator/claude";
import { CursorInstaller } from "@director.run/client-configurator/cursor";
import type { ProxyServer } from "@director.run/mcp/proxy-server";
import { getLogger } from "@director.run/utilities/logger";
import { isAppInstalled } from "@director.run/utilities/os";
import { App } from "@director.run/utilities/os";

const logger = getLogger("gateway/helpers");

export function getStreamablePathForProxy(proxyId: string) {
  return `/${proxyId}/mcp`;
}

export function getSSEPathForProxy(proxyId: string) {
  return `/${proxyId}/sse`;
}

export async function restartConnectedClients(proxy: ProxyServer) {
  logger.info(`restarting connected clients for ${proxy.id}`);

  if (isAppInstalled(App.CLAUDE)) {
    const claudeInstaller = await ClaudeInstaller.create();
    if (claudeInstaller.isInstalled(proxy.id)) {
      logger.info(`${proxy.id} is intalled in claude, restarting...`);
      await claudeInstaller.restart();
    } else {
      logger.info(`${proxy.id} is not installed in claude`);
    }
  }
  if (isAppInstalled(App.CURSOR)) {
    const cursorInstaller = await CursorInstaller.create();
    if (cursorInstaller.isInstalled(proxy.id)) {
      logger.info(`${proxy.id} is intalled in cursor`);
      await cursorInstaller.reload(proxy.id);
    } else {
      logger.info(`${proxy.id} is not installed in cursor`);
    }
  }
}
