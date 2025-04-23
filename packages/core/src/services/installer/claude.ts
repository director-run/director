import os from "node:os";
import path from "node:path";
import { readJSONFile, writeJSONFile } from "@director.run/utilities/json";
import { getLogger } from "@director.run/utilities/logger";
import { App, restartApp } from "@director.run/utilities/os";
import type { ProxyServer } from "../proxy/proxy-server";

const CLAUDE_CONFIG_PATH = path.join(
  os.homedir(),
  "Library/Application Support/Claude/claude_desktop_config.json",
);

const CLAUDE_CONFIG_KEY_PREFIX = "director";

function sse2stdioConfigValue(sseUrl: string) {
  return {
    args: [
      path.resolve(__dirname, "../../../../cli/bin/cli.ts"),
      "sse2stdio",
      sseUrl,
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
  await addMCPServerToClaude({
    key: `${CLAUDE_CONFIG_KEY_PREFIX}__${proxyServer.id}`,
    value: sse2stdioConfigValue(proxyServer.sseUrl),
  });
};

export const uninstallFromClaude = async ({
  proxyServer,
}: {
  proxyServer: ProxyServer;
}) => {
  await removeMCPServerFromClaude({
    key: `${CLAUDE_CONFIG_KEY_PREFIX}__${proxyServer.id}`,
  });
};

export const addMCPServerToClaude = async ({
  key,
  value,
}: {
  key: string;
  value: {
    args: string[];
    command: string;
    env?: Record<string, string>;
  };
}) => {
  logger.info(`updating to Claude configuration in ${CLAUDE_CONFIG_PATH}`);

  const claudeConfig = await readJSONFile<ClaudeConfig>(CLAUDE_CONFIG_PATH);

  const updatedConfig = {
    ...claudeConfig,
    mcpServers: {
      ...(claudeConfig.mcpServers ?? {}),
      [key]: value,
    },
  };

  await writeJSONFile(CLAUDE_CONFIG_PATH, updatedConfig);

  logger.info(`${key} successfully written to Claude config`);

  await restartApp(App.CLAUDE);
};

export const removeMCPServerFromClaude = async ({
  key,
}: {
  key: string;
}) => {
  logger.info(
    `uninstalling from Claude configuration in ${CLAUDE_CONFIG_PATH}`,
  );
  const claudeConfig = await readJSONFile<ClaudeConfig>(CLAUDE_CONFIG_PATH);

  if (!claudeConfig?.mcpServers[key]) {
    logger.info(
      `Server "${key}" not found in Claude config, nothing to uninstall`,
    );
    return;
  }

  const { [key]: removed, ...remainingServers } = claudeConfig.mcpServers;

  const updatedConfig = {
    ...claudeConfig,
    mcpServers: remainingServers,
  };

  await writeJSONFile(CLAUDE_CONFIG_PATH, updatedConfig);
  logger.info(`${key} successfully removed from Claude config`);
  await restartApp(App.CLAUDE);
};
