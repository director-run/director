import { isTest } from "@director.run/utilities/env";
import { ErrorCode } from "@director.run/utilities/error";
import { AppError } from "@director.run/utilities/error";
import { writeJSONFile } from "@director.run/utilities/json";
import { os, App } from "@director.run/utilities/os/index";
import { sleep } from "@director.run/utilities/sleep";
import { AbstractConfigurator, type Installable } from "./types";

export class CursorInstaller extends AbstractConfigurator<CursorConfig> {
  public async isClientPresent() {
    return await os.isAppInstalled(App.CURSOR);
  }

  public async isClientConfigPresent() {
    return await os.isFilePresent(this.configPath);
  }

  public constructor(params: { configPath?: string }) {
    super({
      configPath: params.configPath || os.getConfigFileForApp(App.CURSOR),
      name: "cursor",
    });
  }

  public async isInstalled(name: string) {
    if (!(await this.isClientPresent())) {
      return false;
    }
    await this.initialize();
    return (
      this.config?.mcpServers?.[this.createServerConfigKey(name)] !== undefined
    );
  }

  public async uninstall(name: string | Array<string>) {
    if (Array.isArray(name)) {
      for (const n of name) {
        await this.uninstall(n);
      }
      return;
    }
    await this.initialize();

    if (!this.isInstalled(name)) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `server '${name}' is not installed`,
      );
    }
    this.logger.info(`uninstalling ${name}`);
    const newConfig: CursorConfig = {
      ...this.config,
      mcpServers: { ...(this.config?.mcpServers ?? {}) },
    };
    delete newConfig.mcpServers[this.createServerConfigKey(name)];
    await this.updateConfig(newConfig);
  }

  public async install(attributes: Installable | Array<Installable>) {
    if (Array.isArray(attributes)) {
      for (const entry of attributes) {
        await this.install(entry);
      }
      return;
    }
    await this.initialize();

    if (await this.isInstalled(attributes.name)) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `server '${attributes.name}' is already installed`,
      );
    }
    this.logger.info(`installing ${attributes.name}`);
    const newConfig: CursorConfig = {
      ...this.config,
      mcpServers: { ...(this.config?.mcpServers ?? {}) },
    };
    newConfig.mcpServers[this.createServerConfigKey(attributes.name)] = {
      url: attributes.sseURL,
    };
    await this.updateConfig(newConfig);
  }

  public async restart() {
    await this.initialize();

    if (!isTest()) {
      this.logger.info("restarting cursor");
      await os.restartApp(App.CURSOR);
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
    await this.install({ name, sseURL: url, streamableURL: "" });
  }

  public async list(params?: { includeUnmanaged?: boolean }) {
    await this.initialize();

    this.logger.info("listing servers");
    return Object.entries(this.config?.mcpServers ?? {})
      .filter(([name]) =>
        params?.includeUnmanaged ? true : this.isManagedConfigKey(name),
      )
      .map(([name, transport]) => ({
        name: this.toDisplayName(name),
        url: transport.url,
      }));
  }

  protected async initialize() {
    await super.initialize();
    if (!this.config?.mcpServers) {
      await this.updateConfig({
        ...this.config,
        mcpServers: {},
      });
    }
  }

  public async openConfig() {
    this.logger.info("opening cursor config");
    await os.openFileInCode(this.configPath);
  }

  public async reset(params?: { includeUnmanaged?: boolean }) {
    await this.initialize();

    this.logger.info("purging cursor config");
    const newConfig: CursorConfig = {
      ...this.config,
      mcpServers: {},
    };

    // Preserve unmanaged servers unless explicitly told not to
    if (!params?.includeUnmanaged) {
      for (const [name, server] of Object.entries(
        this.config?.mcpServers ?? {},
      )) {
        if (!this.isManagedConfigKey(name)) {
          newConfig.mcpServers[name] = server;
        }
      }
    }

    await this.updateConfig(newConfig);
  }

  private async updateConfig(newConfig: CursorConfig) {
    this.logger.info(`writing config to ${this.configPath}`);
    await writeJSONFile(this.configPath, newConfig);
    this.config = newConfig;
  }
  public async createConfig() {
    this.logger.info(`initializing cursor config`);
    await writeJSONFile(this.configPath, {
      mcpServers: {},
    });
  }
}

export type CursorConfig = {
  mcpServers: Record<string, { url: string }>;
};

export function isCursorConfigPresent(): boolean {
  return os.isFilePresent(os.getConfigFileForApp(App.CURSOR));
}
