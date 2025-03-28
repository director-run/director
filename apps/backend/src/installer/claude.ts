import { exec } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { AppError, ErrorCode } from "../helpers/error";
import { getLogger } from "../helpers/logger";

const CLAUDE_CONFIG_PATH = path.join(
  os.homedir(),
  "Library/Application Support/Claude/claude_desktop_config.json",
);

const CLAUDE_CONFIG_KEY_PREFIX = "mcp-cli";

const execAsync = promisify(exec);

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const logger = getLogger("installer/claude");

export async function restartClaude(): Promise<void> {
  logger.info("restarting Claude...");
  await execAsync("osascript -e 'tell application \"Claude\" to quit'");
  await sleep(2000);
  await execAsync("open -a Claude");
  logger.info("Claude has been restarted");
}

export const installToClaude = async ({
  name,
}: {
  name: string;
}) => {
  if (!existsSync(CLAUDE_CONFIG_PATH)) {
    throw new AppError(
      ErrorCode.NOT_FOUND,
      `Claude config file not found at: ${CLAUDE_CONFIG_PATH}`,
    );
  }

  logger.info(`updating to Claude configuration in ${CLAUDE_CONFIG_PATH}`);
  // Read the current config
  const configData = await fs.readFile(CLAUDE_CONFIG_PATH, "utf-8");
  const claudeConfig = JSON.parse(configData);
  const updatedConfig = {
    ...claudeConfig,
    mcpServers: {
      ...(claudeConfig.mcpServers ?? {}),
      [`${CLAUDE_CONFIG_KEY_PREFIX}__${name}`]: {
        args: [
          "run",
          path.resolve(__dirname, "../../bin/cli.ts"),
          "start",
          name,
          "--transport",
          "stdio",
        ],
        command: "bun",
      },
    },
  };

  // Write the updated config back
  await fs.writeFile(
    CLAUDE_CONFIG_PATH,
    JSON.stringify(updatedConfig, null, 2),
  );

  logger.info(`${name} successfully written to Claude config`);
  await restartClaude();
};

export const uninstallFromClaude = async ({
  name,
}: {
  name: string;
}) => {
  logger.info(
    `uninstalling from Claude configuration in ${CLAUDE_CONFIG_PATH}`,
  );
  // Check if the Claude config file exists
  if (!existsSync(CLAUDE_CONFIG_PATH)) {
    throw new AppError(
      ErrorCode.NOT_FOUND,
      `Claude config file not found at: ${CLAUDE_CONFIG_PATH}`,
    );
  }

  // Read the current config
  const configData = await fs.readFile(CLAUDE_CONFIG_PATH, "utf-8");
  const claudeConfig = JSON.parse(configData);

  // Check if mcpServers exists in the config
  if (!claudeConfig.mcpServers) {
    logger.info("No mcpServers found in Claude config, nothing to uninstall");
    return;
  }

  // Create a new config object without the entry to be removed
  const serverKey = `${CLAUDE_CONFIG_KEY_PREFIX}__${name}`;

  if (!claudeConfig.mcpServers[serverKey]) {
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

  // Write the updated config back
  await fs.writeFile(
    CLAUDE_CONFIG_PATH,
    JSON.stringify(updatedConfig, null, 2),
  );

  logger.info(`${name} successfully removed from Claude config`);
  await restartClaude();
};
