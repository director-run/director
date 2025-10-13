import { AppError, ErrorCode } from "@director.run/utilities/error";
import { writeJSONFile } from "@director.run/utilities/json";
import { os, App } from "@director.run/utilities/os/index";
import { z } from "zod";
import { AbstractConfigurator } from "./types";

export class ClaudeCodeInstaller extends AbstractConfigurator<ClaudeConfig> {
  public async isClientPresent() {
    return await os.isAppInstalled(App.CLAUDE_CODE);
  }

  public async isClientConfigPresent() {
    return await os.isFilePresent(this.configPath);
  }

  public constructor(params: { configPath?: string }) {
    super({
      configPath: params.configPath || os.getConfigFileForApp(App.CLAUDE_CODE),
      name: "claude-code",
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
    sseURL: string;
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
      type: "http",
      url: attributes.sseURL,
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
      .map(([name, { url }]) => ({
        name,
        url,
      }));
  }

  public async openConfig() {
    this.logger.info("opening code config");
    await os.openFileInCode(this.configPath);
  }

  public restart() {
    this.logger.error("restarting clode code not supported");
    return Promise.resolve();
  }

  public reload(_name: string) {
    this.logger.error("reloading clode code not supported");
    return Promise.resolve();
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
  type: z.literal("http"),
  url: z.string().describe("The URL of the MCP server"),
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
  return os.isFilePresent(os.getConfigFileForApp(App.CLAUDE));
}
