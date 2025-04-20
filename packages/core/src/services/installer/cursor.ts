import os from "node:os";
import path from "node:path";
import { readJSONFile, writeJSONFile } from "@/helpers/json";
import { getLogger } from "@/helpers/logger";
import type { ProxyServer } from "@/services/proxy/proxy-server";

const CURSOR_CONFIG_PATH = path.join(os.homedir(), ".cursor/mcp.json");
const CURSOR_CONFIG_KEY_PREFIX = "director";

const logger = getLogger("installer/cursor");

type CursorConfig = {
  mcpServers: Record<
    string,
    {
      url: string;
    }
  >;
};

export const installToCursor = async ({
  proxyServer,
}: {
  proxyServer: ProxyServer;
}) => {
  logger.info(`updating Cursor configuration in ${CURSOR_CONFIG_PATH}`);
  const config = await readJSONFile<CursorConfig>(CURSOR_CONFIG_PATH);

  const updatedConfig = {
    ...config,
    mcpServers: {
      ...(config.mcpServers ?? {}),
      [`${CURSOR_CONFIG_KEY_PREFIX}__${proxyServer.id}`]: {
        url: proxyServer.sseUrl,
      },
    },
  };

  await writeJSONFile(CURSOR_CONFIG_PATH, updatedConfig);
  logger.info(`${proxyServer.id} successfully written to Cursor config`);
};

export const uninstallFromCursor = async ({
  proxyServer,
}: {
  proxyServer: ProxyServer;
}) => {
  logger.info(
    `uninstalling from Cursor configuration in ${CURSOR_CONFIG_PATH}`,
  );
  const config = await readJSONFile<CursorConfig>(CURSOR_CONFIG_PATH);

  // Create a new config object without the entry to be removed
  const serverKey = `${CURSOR_CONFIG_KEY_PREFIX}__${proxyServer.id}`;

  if (!config?.mcpServers[serverKey]) {
    logger.info(
      `Server "${proxyServer.id}" not found in Cursor config, nothing to uninstall`,
    );
    return;
  }

  // Remove the entry
  const { [serverKey]: removed, ...remainingServers } = config.mcpServers;

  const updatedConfig = {
    ...config,
    mcpServers: remainingServers,
  };

  await writeJSONFile(CURSOR_CONFIG_PATH, updatedConfig);
  logger.info(`${proxyServer.id} successfully removed from Cursor config`);
};
