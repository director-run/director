import os from "node:os";
import path from "node:path";
import { getLogger } from "../../helpers/logger";
import { readJsonFile } from "../../helpers/readJsonFile";
import { writeJsonFile } from "../../helpers/write-json";

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
  name,
}: {
  name: string;
}) => {
  logger.info(`updating to Cursor configuration in ${CURSOR_CONFIG_PATH}`);

  const config = await readJsonFile<CursorConfig>(CURSOR_CONFIG_PATH);

  const updatedConfig = {
    ...config,
    mcpServers: {
      ...(config.mcpServers ?? {}),
      [`${CURSOR_CONFIG_KEY_PREFIX}__${name}`]: {
        url: `http://localhost:3006/${name}/sse`,
      },
    },
  };

  await writeJsonFile(CURSOR_CONFIG_PATH, updatedConfig);

  logger.info(`${name} successfully written to Cursor config`);
};

export const uninstallFromCursor = async ({
  name,
}: {
  name: string;
}) => {
  logger.info(
    `uninstalling from Cursor configuration in ${CURSOR_CONFIG_PATH}`,
  );
  const config = await readJsonFile<CursorConfig>(CURSOR_CONFIG_PATH);

  // Create a new config object without the entry to be removed
  const serverKey = `${CURSOR_CONFIG_KEY_PREFIX}__${name}`;

  if (!config?.mcpServers[serverKey]) {
    logger.info(
      `Server "${name}" not found in Cursor config, nothing to uninstall`,
    );
    return;
  }

  // Remove the entry
  const { [serverKey]: removed, ...remainingServers } = config.mcpServers;

  const updatedConfig = {
    ...config,
    mcpServers: remainingServers,
  };

  await writeJsonFile(CURSOR_CONFIG_PATH, updatedConfig);
  logger.info(`${name} successfully removed from Cursor config`);
};
