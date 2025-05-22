import os from "node:os";
import path from "node:path";
import { ErrorCode } from "@director.run/utilities/error";
import { AppError } from "@director.run/utilities/error";
import { readJSONFile, writeJSONFile } from "@director.run/utilities/json";
import { getLogger } from "@director.run/utilities/logger";
import { App, isAppInstalled, isFilePresent } from "@director.run/utilities/os";
import { z } from "zod";

const CURSOR_COMMAND = "cursor";
const CURSOR_CONFIG_PATH = path.join(os.homedir(), ".cursor/mcp.json");

export const CURSOR_CONFIG_KEY_PREFIX = "director__";

const logger = getLogger("installer/cursor");

export class CursorInstaller {
  private config: CursorConfig;
  public readonly configPath: string;

  private constructor(params: { configPath: string; config: CursorConfig }) {
    this.configPath = params.configPath;
    this.config = params.config;
  }

  public static async create(configPath: string = CURSOR_CONFIG_PATH) {
    logger.info(`reading config from ${configPath}`);
    if (!isCursorInstalled()) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Cursor is not installed command: ${CURSOR_COMMAND}`,
      );
    }
    if (!isCursorConfigPresent()) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Cursor config file not found at ${configPath}`,
      );
    }
    const config = await readJSONFile<CursorConfig>(configPath);
    return new CursorInstaller({
      configPath,
      config: CursorConfigSchema.parse(config),
    });
  }

  public isInstalled(name: string) {
    return this.config.mcpServers[createKey(name)] !== undefined;
  }

  public async uninstall(name: string) {
    logger.info(`uninstalling ${name}`);
    const newConfig = { ...this.config };
    delete newConfig.mcpServers[createKey(name)];
    await this.updateConfig(newConfig);
  }

  public async install(entry: CursorServerEntry) {
    logger.info(`installing ${entry.name}`);
    const newConfig = { ...this.config };
    newConfig.mcpServers[createKey(entry.name)] = { url: entry.url };
    await this.updateConfig(newConfig);
  }

  public async list() {
    logger.info("listing servers");
    return Object.entries(this.config.mcpServers).map(([name, transport]) => ({
      name,
      url: transport.url,
    }));
  }

  public async purge() {
    logger.info("purging cursor config");
    const newConfig = { ...this.config };
    newConfig.mcpServers = {};
    await this.updateConfig(newConfig);
  }

  private async updateConfig(newConfig: CursorConfig) {
    this.config = CursorConfigSchema.parse(newConfig);
    logger.info(`writing config to ${this.configPath}`);
    await writeJSONFile(this.configPath, this.config);
  }
}

const createKey = (name: string) => `${CURSOR_CONFIG_KEY_PREFIX}${name}`;

export const CursorMCPServerSchema = z.object({
  url: z.string().url().describe("The SSE endpoint URL for the MCP server"),
});

export const CursorConfigSchema = z.object({
  mcpServers: z
    .record(z.string(), CursorMCPServerSchema)
    .describe("Map of MCP server configurations"),
});

export type CursorMCPServer = z.infer<typeof CursorMCPServerSchema>;
export type CursorConfig = z.infer<typeof CursorConfigSchema>;
export type CursorServerEntry = {
  name: string;
  url: string;
};

export function isCursorInstalled(): boolean {
  return isAppInstalled(App.CURSOR);
}

export function isCursorConfigPresent(): boolean {
  return isFilePresent(CURSOR_CONFIG_PATH);
}
