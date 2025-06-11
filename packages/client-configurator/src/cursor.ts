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
import { AbstractConfigurator } from "./types";

const CURSOR_CONFIG_PATH = path.join(os.homedir(), ".cursor/mcp.json");

export class CursorInstaller extends AbstractConfigurator<CursorConfig> {
  public async isClientPresent() {
    return await isAppInstalled(App.CURSOR);
  }

  public async isClientConfigPresent() {
    return await isFilePresent(this.configPath);
  }

  public constructor(params: { configPath?: string }) {
    super({
      configPath: params.configPath || CURSOR_CONFIG_PATH,
      name: "cursor",
    });
  }

  public async isInstalled(name: string) {
    await this.initialize();
    return (
      this.config?.mcpServers?.[this.createServerConfigKey(name)] !== undefined
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
    const newConfig: CursorConfig = {
      mcpServers: { ...(this.config?.mcpServers ?? {}) },
    };
    delete newConfig.mcpServers[this.createServerConfigKey(name)];
    await this.updateConfig(newConfig);
  }

  public async install(attributes: { name: string; url: string }) {
    await this.initialize();

    if (await this.isInstalled(attributes.name)) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `server '${attributes.name}' is already installed`,
      );
    }
    this.logger.info(`installing ${attributes.name}`);
    const newConfig: CursorConfig = {
      mcpServers: { ...(this.config?.mcpServers ?? {}) },
    };
    newConfig.mcpServers[this.createServerConfigKey(attributes.name)] = {
      url: attributes.url,
    };
    await this.updateConfig(newConfig);
  }

  public async restart() {
    await this.initialize();

    if (!isTest()) {
      this.logger.info("restarting cursor");
      await restartApp(App.CURSOR);
    } else {
      this.logger.warn("skipping restart of cursor in test environment");
    }
  }

  public async reload(name: string) {
    await this.initialize();

    this.logger.info(`reloading ${name}`);

    const url = this.config?.mcpServers[this.createServerConfigKey(name)]?.url;

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
    return Object.entries(this.config?.mcpServers ?? {}).map(
      ([name, transport]) => ({
        name,
        url: transport.url,
      }),
    );
  }

  public async openConfig() {
    this.logger.info("opening cursor config");
    await openFileInCode(this.configPath);
  }

  public async reset() {
    await this.initialize();

    this.logger.info("purging cursor config");
    const newConfig: CursorConfig = {
      mcpServers: {},
    };
    await this.updateConfig(newConfig);
  }

  private async updateConfig(newConfig: CursorConfig) {
    this.logger.info(`writing config to ${this.configPath}`);
    await writeJSONFile(this.configPath, newConfig);
    this.config = newConfig;
  }
}

export type CursorConfig = {
  mcpServers: Record<string, { url: string }>;
};

export function isCursorConfigPresent(): boolean {
  return isFilePresent(CURSOR_CONFIG_PATH);
}
