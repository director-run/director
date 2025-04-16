import os from "node:os";
import path from "node:path";
import { readJSONFile, writeJSONFile } from "../../helpers/json";
import { getLogger } from "../../helpers/logger";
import { App, restartApp } from "../../helpers/os";
import type { ProxyServer } from "../proxy/ProxyServer";

const CLAUDE_CONFIG_PATH = path.join(
  os.homedir(),
  "Library/Application Support/Claude/claude_desktop_config.json",
);

const CLAUDE_CONFIG_KEY_PREFIX = "director";

function getClaudeConfigEntry(proxyServer: ProxyServer) {
  return {
    args: [
      path.resolve(__dirname, "../../../../cli/bin/cli.ts"),
      "sse2stdio",
      proxyServer.sseUrl,
    ],
    command: "bun",
    env: {
      LOG_LEVEL: "silent",
      PROXY_TARGET_CONNECT_RETRY_COUNT: "0",
    },
  };
}

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
  proxyServer,
}: {
  proxyServer: ProxyServer;
}) => {
  logger.info(`updating to Claude configuration in ${CLAUDE_CONFIG_PATH}`);

  const claudeConfig = await readJSONFile<ClaudeConfig>(CLAUDE_CONFIG_PATH);

  const updatedConfig = {
    ...claudeConfig,
    mcpServers: {
      ...(claudeConfig.mcpServers ?? {}),
      [`${CLAUDE_CONFIG_KEY_PREFIX}__${proxyServer.id}`]:
        getClaudeConfigEntry(proxyServer),
    },
  };

  await writeJSONFile(CLAUDE_CONFIG_PATH, updatedConfig);

  logger.info(`${proxyServer.id} successfully written to Claude config`);

  await restartApp(App.CLAUDE);
};

export const uninstallFromClaude = async ({
  proxyId,
}: {
  proxyId: string;
}) => {
  logger.info(
    `uninstalling from Claude configuration in ${CLAUDE_CONFIG_PATH}`,
  );
  const claudeConfig = await readJSONFile<ClaudeConfig>(CLAUDE_CONFIG_PATH);

  // Create a new config object without the entry to be removed
  const serverKey = `${CLAUDE_CONFIG_KEY_PREFIX}__${proxyId}`;

  if (!claudeConfig?.mcpServers[serverKey]) {
    logger.info(
      `Server "${proxyId}" not found in Claude config, nothing to uninstall`,
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
  logger.info(`${proxyId} successfully removed from Claude config`);
  await restartApp(App.CLAUDE);
};
