import { isTest } from "@director.run/utilities/env";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { writeJSONFile } from "@director.run/utilities/json";
import { os, App } from "@director.run/utilities/os/index";
import { z } from "zod";
import { AbstractClient, type InstallerResult } from "./types";

export class ClaudeInstaller extends AbstractClient<ClaudeConfig> {
  public async isClientPresent() {
    return await os.isAppInstalled(App.CLAUDE);
  }

  public async isClientConfigPresent() {
    return await os.isFilePresent(this.configPath);
  }

  public constructor(params: { configPath?: string; configKeyPrefix: string }) {
    super({
      configPath: params.configPath || os.getConfigFileForApp(App.CLAUDE),
      name: "claude",
      configKeyPrefix: params.configKeyPrefix,
    });
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
    const newConfig: ClaudeConfig = {
      ...this.config,
      mcpServers: { ...this.config?.mcpServers },
    };
    delete newConfig.mcpServers?.[this.createServerConfigKey(name)];
    await this.updateConfig(newConfig);
    return {
      requiresRestart:
        this.getCapabilities().requiresRestartOnInstallOrUninstall,
    };
  }

  public async install(
    attributes:
      | { name: string; streamableURL: string }
      | Array<{ name: string; streamableURL: string }>,
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
    const newConfig: ClaudeConfig = {
      ...this.config,
      mcpServers: { ...this.config?.mcpServers },
    };
    newConfig.mcpServers[this.createServerConfigKey(attributes.name)] = {
      command: "npx",
      args: [
        "-y",
        "@director.run/cli@latest",
        "http2stdio",
        attributes.streamableURL,
      ],
      env: {
        LOG_LEVEL: "silent",
      },
    };
    await this.updateConfig(newConfig);
    return {
      requiresRestart:
        this.getCapabilities().requiresRestartOnInstallOrUninstall,
    };
  }

  public async reset(params?: { includeUnmanaged?: boolean }) {
    await this.initialize();
    this.logger.debug("purging claude config");
    const newConfig: ClaudeConfig = {
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

  public async list(params?: { includeUnmanaged?: boolean }) {
    await this.initialize();
    this.logger.debug("listing servers");
    return Object.entries(this.config?.mcpServers ?? {})
      .filter(([name]) =>
        params?.includeUnmanaged ? true : this.isManagedConfigKey(name),
      )
      .map(([name, transport]) => ({
        name: this.toDisplayName(name),
        url: transport.args[3],
      }));
  }

  public async openConfig() {
    this.logger.debug("opening claude config");
    await os.openFileInCode(this.configPath);
  }

  public async restart() {
    await this.initialize();
    if (!isTest()) {
      this.logger.debug("restarting claude");
      await os.restartApp(App.CLAUDE);
    } else {
      this.logger.warn("skipping restart of claude in test environment");
    }
  }

  private async updateConfig(newConfig: ClaudeConfig) {
    this.config = newConfig;
    this.logger.debug(`writing config to ${this.configPath}`);
    await writeJSONFile(this.configPath, this.config);
  }

  public async createConfig() {
    this.logger.debug(`initializing claude config`);
    await writeJSONFile(this.configPath, {
      mcpServers: {},
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

export const ClaudeMCPServerSchema = z.object({
  command: z.string().describe('The command to execute (e.g., "bun", "node")'),
  args: z.array(z.string()).describe("Command line arguments"),
  env: z.record(z.string()).optional().describe("Environment variables"),
});

export const ClaudeConfigSchema = z.object({
  mcpServers: z
    .record(z.string(), ClaudeMCPServerSchema)
    .describe("Map of MCP server configurations"),
});

export type ClaudeMCPServer = z.infer<typeof ClaudeMCPServerSchema>;
export type ClaudeConfig = z.infer<typeof ClaudeConfigSchema>;
export type ClaudeServerEntry = {
  name: string;
  transport: ClaudeMCPServer;
};
