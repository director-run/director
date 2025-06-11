import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { isTest } from "@director.run/utilities/env";
import { ErrorCode } from "@director.run/utilities/error";
import { AppError } from "@director.run/utilities/error";
import { writeJSONFile } from "@director.run/utilities/json";
import {
  App,
  isAppInstalled,
  isFilePresent,
  openFileInCode,
  sleep,
} from "@director.run/utilities/os";
import { restartApp } from "@director.run/utilities/os";
import { AbstractConfigurator, type Installable } from "./types";

const VSCODE_CONFIG_PATH = path.join(
  os.homedir(),
  "Library/Application Support/Code/User/settings.json",
);

export class VSCodeInstaller extends AbstractConfigurator<VSCodeConfig> {
  public async isClientPresent() {
    return await isAppInstalled(App.VSCODE);
  }
  public async isClientConfigPresent() {
    return await isFilePresent(this.configPath);
  }

  public constructor(params: { configPath?: string }) {
    super({
      configPath: params.configPath || VSCODE_CONFIG_PATH,
      name: "vscode",
    });
  }

  public async isInstalled(name: string) {
    if (
      !(await this.isClientPresent()) ||
      !(await this.isClientConfigPresent())
    ) {
      return false;
    }
    await this.initialize();
    return (
      this.config?.mcp.servers[this.createServerConfigKey(name)] !== undefined
    );
  }

  public async uninstall(name: string) {
    await this.initialize();
    if (!this.isInstalled(name)) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `server '${name}' is not installed`,
      );
    }
    this.logger.info(`uninstalling ${name}`);
    const newConfig: VSCodeConfig = {
      mcp: {
        servers: { ...(this.config?.mcp?.servers ?? {}) },
      },
    };
    delete newConfig.mcp.servers[this.createServerConfigKey(name)];
    await this.updateConfig(newConfig);
  }

  public async install(entry: Installable) {
    await this.initialize();
    if (await this.isInstalled(entry.name)) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `server '${entry.name}' is already installed`,
      );
    }
    this.logger.info(`installing ${entry.name}`);
    const newConfig: VSCodeConfig = {
      mcp: {
        servers: { ...(this.config?.mcp?.servers ?? {}) },
      },
    };
    newConfig.mcp.servers[this.createServerConfigKey(entry.name)] = {
      url: entry.url,
    };
    await this.updateConfig(newConfig);
  }

  public async restart() {
    await this.initialize();
    if (!isTest()) {
      this.logger.info("restarting vscode");
      await restartApp(App.VSCODE);
    } else {
      this.logger.warn("skipping restart of vscode in test environment");
    }
  }

  public async reload(name: string) {
    await this.initialize();
    this.logger.info(`reloading ${name}`);

    const url =
      this.config?.mcp?.servers[this.createServerConfigKey(name)]?.url;
    if (!url) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `server '${name}' is not installed`,
      );
    }
    await this.uninstall(name);
    await sleep(1000);
    await this.install({ name, url });
  }

  public async list() {
    await this.initialize();
    this.logger.info("listing servers");
    return Object.entries(this.config?.mcp.servers ?? {})
      .filter(([name]) => this.isManagedConfigKey(name))
      .map(([name, server]) => ({
        name,
        url: server.url,
      }));
  }

  public async openConfig() {
    this.logger.info("opening vscode config");
    await openFileInCode(this.configPath);
  }

  public async reset() {
    await this.initialize();
    this.logger.info("purging vscode config");
    const newConfig: VSCodeConfig = {
      mcp: {
        servers: {},
      },
    };
    await this.updateConfig(newConfig);
  }

  private async updateConfig(newConfig: VSCodeConfig) {
    this.logger.info(`writing config to ${this.configPath}`);

    // Ensure the directory exists
    const configDir = path.dirname(this.configPath);
    await fs.promises.mkdir(configDir, { recursive: true });

    await writeJSONFile(this.configPath, this.config);
    this.config = newConfig;
  }
}

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
