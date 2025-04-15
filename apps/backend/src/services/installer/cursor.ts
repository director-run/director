import os from "node:os";
import path from "node:path";
import { readJSONFile, writeJSONFile } from "../../helpers/json";
import { getLogger } from "../../helpers/logger";
import { getProxySSEUrl } from "../db/getProxySSEUrl";

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
  proxyId,
}: {
  proxyId: string;
}) => {
  logger.info(`updating to Cursor configuration in ${CURSOR_CONFIG_PATH}`);

  const config = await readJSONFile<CursorConfig>(CURSOR_CONFIG_PATH);

  const updatedConfig = {
    ...config,
    mcpServers: {
      ...(config.mcpServers ?? {}),
      [`${CURSOR_CONFIG_KEY_PREFIX}__${proxyId}`]: {
        url: getProxySSEUrl(proxyId),
      },
    },
  };

  await writeJSONFile(CURSOR_CONFIG_PATH, updatedConfig);

  logger.info(`${proxyId} successfully written to Cursor config`);
};

export const uninstallFromCursor = async ({
  proxyId,
}: {
  proxyId: string;
}) => {
  logger.info(
    `uninstalling from Cursor configuration in ${CURSOR_CONFIG_PATH}`,
  );
  const config = await readJSONFile<CursorConfig>(CURSOR_CONFIG_PATH);

  // Create a new config object without the entry to be removed
  const serverKey = `${CURSOR_CONFIG_KEY_PREFIX}__${proxyId}`;

  if (!config?.mcpServers[serverKey]) {
    logger.info(
      `Server "${proxyId}" not found in Cursor config, nothing to uninstall`,
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
  logger.info(`${proxyId} successfully removed from Cursor config`);
};
