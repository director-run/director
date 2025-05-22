import os from "node:os";
import path from "node:path";
import { isTest } from "@director.run/utilities/env";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { readJSONFile, writeJSONFile } from "@director.run/utilities/json";
import { getLogger } from "@director.run/utilities/logger";
import {
  App,
  isAppInstalled,
  isFilePresent,
  openFileInCode,
  restartApp,
} from "@director.run/utilities/os";
import { z } from "zod";

export const CLAUDE_COMMAND = "claude";
export const CLAUDE_CONFIG_PATH = path.join(
  os.homedir(),
  "Library/Application Support/Claude/claude_desktop_config.json",
);
export const CLAUDE_CONFIG_KEY_PREFIX = "director__";

const logger = getLogger("installer/claude");

export class ClaudeInstaller {
  private config: ClaudeConfig;
  public readonly configPath: string;

  private constructor(params: { configPath: string; config: ClaudeConfig }) {
    this.configPath = params.configPath;
    this.config = params.config;
  }

  public static async create(configPath: string = CLAUDE_CONFIG_PATH) {
    logger.info(`reading config from ${configPath}`);
    if (!isClaudeInstalled()) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Claude desktop app is not installed command: ${CLAUDE_COMMAND}`,
      );
    }
    if (!isClaudeConfigPresent()) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Claude config file not found at ${configPath}`,
      );
    }
    const config = await readJSONFile<ClaudeConfig>(configPath);
    return new ClaudeInstaller({
      configPath,
      config: ClaudeConfigSchema.parse(config),
    });
  }

  public isInstalled(name: string) {
    return this.config.mcpServers[createKey(name)] !== undefined;
  }

  public async uninstall(name: string) {
    if (!this.isInstalled(name)) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `server '${name}' is not installed`,
      );
    }
    logger.info(`uninstalling ${name}`);
    const newConfig = { ...this.config };
    delete newConfig.mcpServers[createKey(name)];
    await this.updateConfig(newConfig);
  }

  public async install(entry: ClaudeServerEntry) {
    if (this.isInstalled(entry.name)) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `server '${entry.name}' is already installed`,
      );
    }
    logger.info(`installing ${entry.name}`);
    const newConfig = { ...this.config };
    newConfig.mcpServers[createKey(entry.name)] = entry.transport;
    await this.updateConfig(newConfig);
  }

  public async purge() {
    logger.info("purging claude config");
    const newConfig = { ...this.config };
    newConfig.mcpServers = {};
    await this.updateConfig(newConfig);
  }

  public async list() {
    logger.info("listing servers");
    return Object.entries(this.config.mcpServers).map(([name, transport]) => ({
      name,
      transport,
    }));
  }

  public async openConfig() {
    logger.info("opening claude config");
    await openFileInCode(this.configPath);
  }

  public async restartClaude() {
    if (!isTest()) {
      logger.info("restarting claude");
      await restartApp(App.CLAUDE);
    } else {
      logger.warn("skipping restart of claude in test environment");
    }
  }

  private async updateConfig(newConfig: ClaudeConfig) {
    this.config = ClaudeConfigSchema.parse(newConfig);
    logger.info(`writing config to ${this.configPath}`);
    await writeJSONFile(this.configPath, this.config);
    await this.restartClaude();
  }
}

const createKey = (name: string) => `${CLAUDE_CONFIG_KEY_PREFIX}${name}`;

export const ClaudeMCPServerSchema = z.object({
  command: z.string().describe('The command to execute (e.g., "bun", "node")'),
  args: z.array(z.string()).describe("Command line arguments"),
  env: z.record(z.string()).optional().describe("Environment variables"),
});

export const ClaudeConfigSchema = z.object({
  mcpServers: z
    .record(z.string(), ClaudeMCPServerSchema)
    .describe("Map of MCP server configurations"),
});

export type ClaudeMCPServer = z.infer<typeof ClaudeMCPServerSchema>;
export type ClaudeConfig = z.infer<typeof ClaudeConfigSchema>;
export type ClaudeServerEntry = {
  name: string;
  transport: ClaudeMCPServer;
};

export function isClaudeInstalled(): boolean {
  return isAppInstalled(App.CLAUDE);
}

export function isClaudeConfigPresent(): boolean {
  return isFilePresent(CLAUDE_CONFIG_PATH);
}
