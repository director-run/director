import { isTest } from "@director.run/utilities/env";
import { ErrorCode } from "@director.run/utilities/error";
import { AppError } from "@director.run/utilities/error";
import { writeJSONFile } from "@director.run/utilities/json";
import { os, App } from "@director.run/utilities/os/index";
import {
  AbstractClient,
  type Installable,
  type InstallerResult,
} from "./types";

export class CursorInstaller extends AbstractClient<CursorConfig> {
  public async isClientPresent() {
    return await os.isAppInstalled(App.CURSOR);
  }

  public async isClientConfigPresent() {
    return await os.isFilePresent(this.configPath);
  }

  public constructor(params: { configPath?: string; configKeyPrefix: string }) {
    super({
      configPath: params.configPath || os.getConfigFileForApp(App.CURSOR),
      name: "cursor",
      configKeyPrefix: params.configKeyPrefix,
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

  public async uninstall(
    name: string | Array<string>,
  ): Promise<InstallerResult> {
    if (Array.isArray(name)) {
      let requiresRestart = false;
      for (const n of name) {
        const result = await this.uninstall(n);
        requiresRestart = requiresRestart || result.requiresRestart;
      }
      return { requiresRestart };
    }
    await this.initialize();

    if (!(await this.isInstalled(name))) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `server '${name}' is not installed`,
      );
    }
    this.logger.debug(`uninstalling ${name}`);
    const newConfig: CursorConfig = {
      ...this.config,
      mcpServers: { ...(this.config?.mcpServers ?? {}) },
    };
    delete newConfig.mcpServers[this.createServerConfigKey(name)];
    await this.updateConfig(newConfig);
    return {
      requiresRestart:
        this.getCapabilities().requiresRestartOnInstallOrUninstall,
    };
  }

  public async install(
    attributes: Installable | Array<Installable>,
  ): Promise<InstallerResult> {
    if (Array.isArray(attributes)) {
      let requiresRestart = false;
      for (const entry of attributes) {
        const result = await this.install(entry);
        requiresRestart = requiresRestart || result.requiresRestart;
      }
      return { requiresRestart };
    }
    await this.initialize();

    if (await this.isInstalled(attributes.name)) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `server '${attributes.name}' is already installed`,
      );
    }
    this.logger.debug(`installing ${attributes.name}`);
    const newConfig: CursorConfig = {
      ...this.config,
      mcpServers: { ...(this.config?.mcpServers ?? {}) },
    };
    newConfig.mcpServers[this.createServerConfigKey(attributes.name)] = {
      url: attributes.streamableURL,
    };
    await this.updateConfig(newConfig);
    return {
      requiresRestart:
        this.getCapabilities().requiresRestartOnInstallOrUninstall,
    };
  }

  public async restart() {
    await this.initialize();

    if (!isTest()) {
      this.logger.debug("restarting cursor");
      await os.restartApp(App.CURSOR);
    } else {
      this.logger.warn("skipping restart of cursor in test environment");
    }
  }

  public async list(params?: { includeUnmanaged?: boolean }) {
    await this.initialize();

    this.logger.debug("listing servers");
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
    this.logger.debug("opening cursor config");
    await os.openFileInCode(this.configPath);
  }

  public async reset(params?: {
    includeUnmanaged?: boolean;
  }): Promise<InstallerResult> {
    await this.initialize();

    this.logger.debug("purging cursor config");
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

    // If nothing changed, do not write or request restart
    const noChange = JSON.stringify(newConfig) === JSON.stringify(this.config);
    if (noChange) {
      return { requiresRestart: false };
    }

    await this.updateConfig(newConfig);
    return {
      requiresRestart:
        this.getCapabilities().requiresRestartOnInstallOrUninstall,
    };
  }

  private async updateConfig(newConfig: CursorConfig) {
    this.logger.debug(`writing config to ${this.configPath}`);
    await writeJSONFile(this.configPath, newConfig);
    // wait a second for changes in cursor to take effect
    // await sleep(1000);
    this.config = newConfig;
  }
  public async createConfig() {
    this.logger.debug(`initializing cursor config`);
    await writeJSONFile(this.configPath, {
      mcpServers: {},
    });
  }

  public getCapabilities() {
    return {
      requiresRestartOnInstallOrUninstall: false,
      requiresRestartOnUpdate: false,
      programaticRestartSupported: true,
    };
  }
}

export type CursorConfig = {
  mcpServers: Record<string, { url: string }>;
};

export function isCursorConfigPresent(): boolean {
  return os.isFilePresent(os.getConfigFileForApp(App.CURSOR));
}
