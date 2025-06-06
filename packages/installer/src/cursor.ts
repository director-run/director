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
import { AbstractInstaller } from "./abstract-installer";

const CURSOR_COMMAND = "cursor";
const CURSOR_CONFIG_PATH = path.join(os.homedir(), ".cursor/mcp.json");

export const CURSOR_CONFIG_KEY_PREFIX = "director__";

const logger = getLogger("installer/cursor");

export class CursorInstaller extends AbstractInstaller {
  private config: CursorConfig;
  public readonly configPath: string;

  private constructor(params: { configPath: string; config: CursorConfig }) {
    super();
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
      config,
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

  public async install(attributes: { name: string; url: string }) {
    if (this.isInstalled(attributes.name)) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `server '${attributes.name}' is already installed`,
      );
    }
    logger.info(`installing ${attributes.name}`);
    const newConfig = { ...this.config };
    newConfig.mcpServers[createKey(attributes.name)] = { url: attributes.url };
    await this.updateConfig(newConfig);
  }

  public async restart() {
    if (!isTest()) {
      logger.info("restarting cursor");
      await restartApp(App.CURSOR);
    } else {
      logger.warn("skipping restart of cursor in test environment");
    }
  }

  public async reload(name: string) {
    logger.info(`reloading ${name}`);

    const url = this.config.mcpServers[createKey(name)].url;
    await this.uninstall(name);
    await sleep(1000);
    await this.install({ name, url });
  }

  public async list() {
    logger.info("listing servers");
    return Object.entries(this.config.mcpServers).map(([name, transport]) => ({
      name,
      url: transport.url,
    }));
  }

  public async openConfig() {
    logger.info("opening cursor config");
    await openFileInCode(this.configPath);
  }

  public async purge() {
    logger.info("purging cursor config");
    const newConfig = { ...this.config };
    newConfig.mcpServers = {};
    await this.updateConfig(newConfig);
  }

  private async updateConfig(newConfig: CursorConfig) {
    logger.info(`writing config to ${this.configPath}`);
    await writeJSONFile(this.configPath, this.config);
  }
}

const createKey = (name: string) => `${CURSOR_CONFIG_KEY_PREFIX}${name}`;

export type CursorConfig = {
  mcpServers: Record<string, { url: string }>;
};

export function isCursorInstalled(): boolean {
  return isAppInstalled(App.CURSOR);
}

export function isCursorConfigPresent(): boolean {
  return isFilePresent(CURSOR_CONFIG_PATH);
}
