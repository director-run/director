import os from "node:os";
import path from "node:path";
import { readJSONFile, writeJSONFile } from "@director.run/utilities/json";
import { getLogger } from "@director.run/utilities/logger";
import { z } from "zod";

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
    const config = await readJSONFile<CursorConfig>(configPath);
    return new CursorInstaller({
      configPath,
      config: CursorConfigSchema.parse(config),
    });
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
    return Object.entries(this.config.mcpServers).map(([name, transport]) => ({
      name,
      url: transport.url,
    }));
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
