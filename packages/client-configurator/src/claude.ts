import os from "node:os";
import path from "node:path";
import { isTest } from "@director.run/utilities/env";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { writeJSONFile } from "@director.run/utilities/json";
import {
  App,
  isAppInstalled,
  isFilePresent,
  openFileInCode,
  restartApp,
} from "@director.run/utilities/os";
import { z } from "zod";
import { AbstractConfigurator } from "./types";

export const CLAUDE_CONFIG_PATH = path.join(
  os.homedir(),
  "Library/Application Support/Claude/claude_desktop_config.json",
);

export class ClaudeInstaller extends AbstractConfigurator<ClaudeConfig> {
  public async isClientPresent() {
    return await isAppInstalled(App.CLAUDE);
  }

  public async isClientConfigPresent() {
    return await isFilePresent(this.configPath);
  }

  public constructor(params: { configPath?: string }) {
    super({
      configPath: params.configPath || CLAUDE_CONFIG_PATH,
      name: "claude",
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

  public async uninstall(name: string) {
    await this.initialize();
    if (!this.isInstalled(name)) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `server '${name}' is not installed`,
      );
    }
    this.logger.info(`uninstalling ${name}`);
    const newConfig: ClaudeConfig = {
      mcpServers: { ...this.config?.mcpServers },
    };
    delete newConfig.mcpServers?.[this.createServerConfigKey(name)];
    await this.updateConfig(newConfig);
  }

  public async install(attributes: {
    name: string;
    url: string;
  }) {
    await this.initialize();
    if (await this.isInstalled(attributes.name)) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `server '${attributes.name}' is already installed`,
      );
    }
    this.logger.info(`installing ${attributes.name}`);
    const newConfig: ClaudeConfig = {
      mcpServers: { ...this.config?.mcpServers },
    };
    newConfig.mcpServers[this.createServerConfigKey(attributes.name)] = {
      command: "npx",
      args: ["-y", "@director.run/cli", "http2stdio", attributes.url],
      env: {
        LOG_LEVEL: "silent",
      },
    };
    await this.updateConfig(newConfig);
  }

  public async reset() {
    await this.initialize();
    this.logger.info("purging claude config");
    const newConfig: ClaudeConfig = {
      mcpServers: { ...this.config?.mcpServers },
    };
    newConfig.mcpServers = {};
    await this.updateConfig(newConfig);
  }

  public async list() {
    await this.initialize();
    this.logger.info("listing servers");
    return Object.entries(this.config?.mcpServers ?? {})
      .filter(([name]) => this.isManagedConfigKey(name))
      .map(([name, transport]) => ({
        name,
        url: transport.args[3],
      }));
  }

  public async openConfig() {
    this.logger.info("opening claude config");
    await openFileInCode(this.configPath);
  }

  public async restart() {
    if (!isTest()) {
      this.logger.info("restarting claude");
      await restartApp(App.CLAUDE);
    } else {
      this.logger.warn("skipping restart of claude in test environment");
    }
  }

  public async reload(name: string) {
    await this.initialize();

    this.logger.info(`reloading ${name}`);
    await this.restart();
  }

  private async updateConfig(newConfig: ClaudeConfig) {
    this.config = newConfig;
    this.logger.info(`writing config to ${this.configPath}`);
    await writeJSONFile(this.configPath, this.config);
    await this.restart();
  }

  public async createConfig() {
    this.logger.info(`initializing claude config`);
    await writeJSONFile(this.configPath, {
      mcpServers: {},
    });
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

export function isClaudeConfigPresent(): boolean {
  return isFilePresent(CLAUDE_CONFIG_PATH);
}
