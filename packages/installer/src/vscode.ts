import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { isTest } from "@director.run/utilities/env";
import { ErrorCode } from "@director.run/utilities/error";
import { AppError } from "@director.run/utilities/error";
import { readJSONFile, writeJSONFile } from "@director.run/utilities/json";
import { getLogger } from "@director.run/utilities/logger";
import {
  App,
  isAppInstalled,
  isFilePresent,
  openFileInCode,
  sleep,
} from "@director.run/utilities/os";
import { restartApp } from "@director.run/utilities/os";
import { z } from "zod";
import { AbstractInstaller } from "./abstract-installer";

const VSCODE_COMMAND = "code";
const VSCODE_CONFIG_PATH = path.join(
  os.homedir(),
  "Library/Application Support/Code/User/settings.json",
);

export const VSCODE_CONFIG_KEY_PREFIX = "director__";

const logger = getLogger("installer/vscode");

export class VSCodeInstaller extends AbstractInstaller {
  private config: VSCodeConfig;
  public readonly configPath: string;

  private constructor(params: { configPath: string; config: VSCodeConfig }) {
    super();
    this.configPath = params.configPath;
    this.config = params.config;
  }

  public static async create(configPath: string = VSCODE_CONFIG_PATH) {
    logger.info(`reading config from ${configPath}`);
    if (!isVSCodeInstalled()) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `VSCode is not installed command: ${VSCODE_COMMAND}`,
      );
    }

    let config: Partial<VSCodeConfig>;

    if (!isVSCodeConfigPresent()) {
      logger.info(
        `VSCode config file not found at ${configPath}, creating new one`,
      );
      config = {};
    } else {
      config = await readJSONFile<Partial<VSCodeConfig>>(configPath);
    }

    // Initialize mcp object if it doesn't exist
    if (!config.mcp) {
      config.mcp = {
        servers: {},
      };
    }

    const installer = new VSCodeInstaller({
      configPath,
      config: VSCodeConfigSchema.parse(config),
    });

    // Create the file if it doesn't exist
    if (!isVSCodeConfigPresent()) {
      await installer.updateConfig(installer.config);
    }

    return installer;
  }

  public isInstalled(name: string) {
    return this.config.mcp.servers[createKey(name)] !== undefined;
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
    delete newConfig.mcp.servers[createKey(name)];
    await this.updateConfig(newConfig);
  }

  public async install(entry: VSCodeServerEntry) {
    if (this.isInstalled(entry.name)) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `server '${entry.name}' is already installed`,
      );
    }
    logger.info(`installing ${entry.name}`);
    const newConfig = { ...this.config };
    newConfig.mcp.servers[createKey(entry.name)] = { url: entry.url };
    await this.updateConfig(newConfig);
  }

  public async restart() {
    if (!isTest()) {
      logger.info("restarting vscode");
      await restartApp(App.VSCODE);
    } else {
      logger.warn("skipping restart of vscode in test environment");
    }
  }

  public async reload(name: string) {
    logger.info(`reloading ${name}`);

    const url = this.config.mcp.servers[createKey(name)].url;
    await this.uninstall(name);
    await sleep(1000);
    await this.install({ name, url });
  }

  public async list() {
    logger.info("listing servers");
    return Object.entries(this.config.mcp.servers)
      .filter(([name]) => name.startsWith(VSCODE_CONFIG_KEY_PREFIX))
      .map(([name, server]) => ({
        name: name.replace(VSCODE_CONFIG_KEY_PREFIX, ""),
        url: server.url,
      }));
  }

  public async openConfig() {
    logger.info("opening vscode config");
    await openFileInCode(this.configPath);
  }

  public async purge() {
    logger.info("purging vscode config");
    const newConfig = { ...this.config };
    // Only remove director-managed servers
    const filteredServers: Record<string, VSCodeMCPServer> = {};
    Object.entries(newConfig.mcp.servers).forEach(([name, server]) => {
      if (!name.startsWith(VSCODE_CONFIG_KEY_PREFIX)) {
        filteredServers[name] = server;
      }
    });
    newConfig.mcp.servers = filteredServers;
    await this.updateConfig(newConfig);
  }

  private async updateConfig(newConfig: VSCodeConfig) {
    this.config = VSCodeConfigSchema.parse(newConfig);
    logger.info(`writing config to ${this.configPath}`);

    // Ensure the directory exists
    const configDir = path.dirname(this.configPath);
    await fs.promises.mkdir(configDir, { recursive: true });

    await writeJSONFile(this.configPath, this.config);
  }
}

const createKey = (name: string) => `${VSCODE_CONFIG_KEY_PREFIX}${name}`;

export const VSCodeMCPServerSchema = z.object({
  url: z.string().url().describe("The SSE endpoint URL for the MCP server"),
});

export const VSCodeMCPConfigSchema = z.object({
  servers: z
    .record(z.string(), VSCodeMCPServerSchema)
    .describe("Map of MCP server configurations"),
});

export const VSCodeConfigSchema = z
  .object({
    mcp: VSCodeMCPConfigSchema.describe("MCP configuration for VSCode"),
    // Allow other settings to exist in the config
  })
  .passthrough();

export type VSCodeMCPServer = z.infer<typeof VSCodeMCPServerSchema>;
export type VSCodeMCPConfig = z.infer<typeof VSCodeMCPConfigSchema>;
export type VSCodeConfig = z.infer<typeof VSCodeConfigSchema>;
export type VSCodeServerEntry = {
  name: string;
  url: string;
};

export function isVSCodeInstalled(): boolean {
  return isAppInstalled(App.VSCODE);
}

export function isVSCodeConfigPresent(): boolean {
  return isFilePresent(VSCODE_CONFIG_PATH);
}
