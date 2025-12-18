import fs from "node:fs";
import path from "node:path";
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

export class VSCodeInstaller extends AbstractClient<VSCodeConfig> {
  public async isClientPresent() {
    return await os.isAppInstalled(App.VSCODE);
  }
  public async isClientConfigPresent() {
    return await os.isFilePresent(this.configPath);
  }

  public constructor(params: { configPath?: string; configKeyPrefix: string }) {
    super({
      configPath: params.configPath || os.getConfigFileForApp(App.VSCODE),
      name: "vscode",
      configKeyPrefix: params.configKeyPrefix,
    });
  }

  protected async initialize() {
    await super.initialize();
    if (!this.config?.mcp?.servers) {
      // If the config is missing the mcp servers, we need to initialize it
      await this.updateConfig({
        ...this.config,
        mcp: {
          servers: {},
        },
      });
    }
  }

  public async isInstalled(name: string) {
    if (!(await this.isClientPresent())) {
      return false;
    }
    await this.initialize();
    return (
      this.config?.mcp.servers[this.createServerConfigKey(name)] !== undefined
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
    const newConfig: VSCodeConfig = {
      ...this.config,
      mcp: {
        servers: { ...(this.config?.mcp?.servers ?? {}) },
      },
    };
    delete newConfig.mcp.servers[this.createServerConfigKey(name)];
    await this.updateConfig(newConfig);
    return {
      requiresRestart:
        this.getCapabilities().requiresRestartOnInstallOrUninstall,
    };
  }

  public async install(
    entry: Installable | Array<Installable>,
  ): Promise<InstallerResult> {
    if (Array.isArray(entry)) {
      let requiresRestart = false;
      for (const e of entry) {
        const result = await this.install(e);
        requiresRestart = requiresRestart || result.requiresRestart;
      }
      return { requiresRestart };
    }
    await this.initialize();
    if (await this.isInstalled(entry.name)) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `server '${entry.name}' is already installed`,
      );
    }
    this.logger.debug(`installing ${entry.name}`);
    const newConfig: VSCodeConfig = {
      ...this.config,
      mcp: {
        servers: { ...(this.config?.mcp?.servers ?? {}) },
      },
    };
    newConfig.mcp.servers[this.createServerConfigKey(entry.name)] = {
      url: entry.streamableURL,
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
      this.logger.debug("restarting vscode");
      await os.restartApp(App.VSCODE);
    } else {
      this.logger.warn("skipping restart of vscode in test environment");
    }
  }

  public async list(params?: { includeUnmanaged?: boolean }) {
    await this.initialize();
    this.logger.debug("listing servers");
    return Object.entries(this.config?.mcp.servers ?? {})
      .filter(([name]) =>
        params?.includeUnmanaged ? true : this.isManagedConfigKey(name),
      )
      .map(([name, server]) => ({
        name: this.toDisplayName(name),
        url: server.url,
      }));
  }

  public async openConfig() {
    this.logger.debug("opening vscode config");
    await os.openFileInCode(this.configPath);
  }

  public async reset(params?: { includeUnmanaged?: boolean }) {
    await this.initialize();
    this.logger.debug("purging vscode config");
    const newConfig: VSCodeConfig = {
      ...this.config,
      mcp: {
        servers: {},
      },
    };

    // Preserve unmanaged servers unless explicitly told not to
    if (!params?.includeUnmanaged) {
      for (const [name, server] of Object.entries(
        this.config?.mcp?.servers ?? {},
      )) {
        if (!this.isManagedConfigKey(name)) {
          newConfig.mcp.servers[name] = server;
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

  private async updateConfig(newConfig: VSCodeConfig) {
    this.logger.debug(`writing config to ${this.configPath}`);

    // Ensure the directory exists
    const configDir = path.dirname(this.configPath);
    await fs.promises.mkdir(configDir, { recursive: true });

    await writeJSONFile(this.configPath, newConfig);
    this.config = newConfig;
  }

  public async createConfig() {
    this.logger.debug(`initializing vscode config`);
    await writeJSONFile(this.configPath, {
      mcp: { servers: {} },
    });
  }

  public getCapabilities() {
    return {
      requiresRestartOnInstallOrUninstall: true,
      requiresRestartOnUpdate: true,
      programaticRestartSupported: true,
    };
  }
}

export type VSCodeConfig = {
  mcp: {
    servers: Record<string, { url: string }>;
  };
};

export function isVSCodeInstalled(): boolean {
  return os.isAppInstalled(App.VSCODE);
}

export function isVSCodeConfigPresent(): boolean {
  return os.isFilePresent(os.getConfigFileForApp(App.VSCODE));
}
