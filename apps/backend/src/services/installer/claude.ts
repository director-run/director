import os from "node:os";
import path from "node:path";
import { getLogger } from "../../helpers/logger";
import { readJSONFile } from "../../helpers/readJSONFile";
import { App, restartApp } from "../../helpers/restartApp";
import { writeJSONFile } from "../../helpers/writeJSONFile";
import { getProxySSEUrl } from "../proxy/getProxySSEUrl";

const CLAUDE_CONFIG_PATH = path.join(
  os.homedir(),
  "Library/Application Support/Claude/claude_desktop_config.json",
);

const CLAUDE_CONFIG_KEY_PREFIX = "director";

const logger = getLogger("installer/claude");

type ClaudeConfig = {
  mcpServers: Record<
    string,
    {
      args: string[];
      command: string;
    }
  >;
};

export const installToClaude = async ({
  name,
}: {
  name: string;
}) => {
  logger.info(`updating to Claude configuration in ${CLAUDE_CONFIG_PATH}`);

  const claudeConfig = await readJSONFile<ClaudeConfig>(CLAUDE_CONFIG_PATH);

  const updatedConfig = {
    ...claudeConfig,
    mcpServers: {
      ...(claudeConfig.mcpServers ?? {}),
      [`${CLAUDE_CONFIG_KEY_PREFIX}__${name}`]: {
        args: [
          path.resolve(__dirname, "../../../bin/cli.ts"),
          "sse2stdio",
          getProxySSEUrl(name),
        ],
        command: "bun",
      },
    },
  };

  await writeJSONFile(CLAUDE_CONFIG_PATH, updatedConfig);

  logger.info(`${name} successfully written to Claude config`);

  await restartApp(App.CLAUDE);
};

export const uninstallFromClaude = async ({
  name,
}: {
  name: string;
}) => {
  logger.info(
    `uninstalling from Claude configuration in ${CLAUDE_CONFIG_PATH}`,
  );
  const claudeConfig = await readJSONFile<ClaudeConfig>(CLAUDE_CONFIG_PATH);

  // Create a new config object without the entry to be removed
  const serverKey = `${CLAUDE_CONFIG_KEY_PREFIX}__${name}`;

  if (!claudeConfig?.mcpServers[serverKey]) {
    logger.info(
      `Server "${name}" not found in Claude config, nothing to uninstall`,
    );
    return;
  }

  // Remove the entry
  const { [serverKey]: removed, ...remainingServers } = claudeConfig.mcpServers;

  const updatedConfig = {
    ...claudeConfig,
    mcpServers: remainingServers,
  };

  await writeJSONFile(CLAUDE_CONFIG_PATH, updatedConfig);
  logger.info(`${name} successfully removed from Claude config`);
  await restartApp(App.CLAUDE);
};
