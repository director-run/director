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
import _ from "lodash";
import { AbstractConfigurator, type Installable } from "./types";

const VSCODE_COMMAND = "code";
const VSCODE_CONFIG_PATH = path.join(
  os.homedir(),
  "Library/Application Support/Code/User/settings.json",
);

export const VSCODE_CONFIG_KEY_PREFIX = "director__";

const logger = getLogger("client-configurator/vscode");

export class VSCodeInstaller extends AbstractConfigurator {
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

    let config: VSCodeConfig;

    if (!isVSCodeConfigPresent()) {
      logger.info(
        `VSCode config file not found at ${configPath}, creating new one`,
      );
      config = {
        mcp: {
          servers: {},
        },
      };
    } else {
      config = await readJSONFile<VSCodeConfig>(configPath);
    }

    // Initialize mcp object if it doesn't exist
    if (!config.mcp) {
      config.mcp = {
        servers: {},
      };
    }

    const installer = new VSCodeInstaller({
      configPath,
      config,
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

  public async install(entry: Installable) {
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
        name,
        url: server.url,
      }));
  }

  public async openConfig() {
    logger.info("opening vscode config");
    await openFileInCode(this.configPath);
  }

  public async reset() {
    logger.info("purging vscode config");
    const newConfig = { ...this.config };
    newConfig.mcp.servers = {};
    await this.updateConfig(newConfig);
  }

  private async updateConfig(newConfig: VSCodeConfig) {
    if (_.isEqual(this.config, newConfig)) {
      logger.info("no changes, skipping update");
      return;
    }

    logger.info(`writing config to ${this.configPath}`);

    // Ensure the directory exists
    const configDir = path.dirname(this.configPath);
    await fs.promises.mkdir(configDir, { recursive: true });

    await writeJSONFile(this.configPath, this.config);
    this.config = newConfig;
  }
}

const createKey = (name: string) => `${VSCODE_CONFIG_KEY_PREFIX}${name}`;

export type VSCodeConfig = {
  mcp: {
    servers: Record<string, { url: string }>;
  };
};

export function isVSCodeInstalled(): boolean {
  return isAppInstalled(App.VSCODE);
}

export function isVSCodeConfigPresent(): boolean {
  return isFilePresent(VSCODE_CONFIG_PATH);
}
