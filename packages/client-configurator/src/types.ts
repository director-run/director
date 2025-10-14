import { AppError, ErrorCode } from "@director.run/utilities/error";
import { readJSONFile } from "@director.run/utilities/json";
import { type Logger, getLogger } from "@director.run/utilities/logger";
const CONFIG_KEY_PREFIX = "director__";

export type InstallerResult = {
  requiresRestart: boolean;
};

export abstract class AbstractConfigurator<T> {
  protected config?: T;
  protected isInitialized;
  protected logger: Logger;
  public readonly configPath: string;
  public readonly name: string;

  public constructor(params: { configPath: string; name: string }) {
    this.configPath = params.configPath;
    this.isInitialized = false;
    this.name = params.name;
    this.logger = getLogger(`client-configurator/${this.name}`);
  }

  protected async initialize() {
    if (this.isInitialized && this.config) {
      return;
    }

    this.logger.info(`initializing`);
    if (!(await this.isClientPresent())) {
      throw new AppError(
        ErrorCode.COMMAND_NOT_FOUND,
        `${this.name} doesn't appear to be installed`,
        {
          name: this.name,
          configPath: this.configPath,
        },
      );
    }
    if (!(await this.isClientConfigPresent())) {
      await this.createConfig();
    }

    try {
      this.config = await readJSONFile<T>(this.configPath);
      this.isInitialized = true;
    } catch (error) {
      // check if the error is a syntax error
      if (error instanceof SyntaxError) {
        throw new AppError(
          ErrorCode.JSON_PARSE_ERROR,
          `syntax error in config file: ${error.message}`,
          { path: this.configPath },
        );
      } else {
        throw error;
      }
    }
  }

  public async getStatus(): Promise<{
    name: string;
    installed: boolean;
    configExists: boolean;
    configPath: string;
    workspaces: Array<{ id: string }>;
  }> {
    const installed = await this.isClientPresent();
    const configExists = await this.isClientConfigPresent();
    const workspaces =
      configExists && installed
        ? (await this.list()).map((server) => ({
            id: server.name,
          }))
        : [];

    return {
      name: this.name,
      installed,
      configExists,
      configPath: this.configPath,
      workspaces,
    };
  }

  protected createServerConfigKey(name: string) {
    return `${CONFIG_KEY_PREFIX}${name}`;
  }

  protected isManagedConfigKey(key: string) {
    return key.startsWith(CONFIG_KEY_PREFIX);
  }

  protected toDisplayName(key: string) {
    return this.isManagedConfigKey(key)
      ? key.replace(CONFIG_KEY_PREFIX, "")
      : key;
  }

  public abstract getCapabilities(): {
    requiresRestartOnInstallOrUninstall: boolean;
    requiresRestartOnUpdate: boolean;
    programaticRestartSupported: boolean;
  };

  public abstract install(
    attributes: Installable | Array<Installable>,
  ): Promise<InstallerResult>;
  public abstract uninstall(
    name: string | Array<string>,
  ): Promise<InstallerResult>;
  public abstract list(params?: {
    includeUnmanaged?: boolean;
  }): Promise<Array<{ name: string; url: string }>>;
  public abstract openConfig(): Promise<void>;
  public abstract isInstalled(name: string): Promise<boolean>;
  public abstract restart(): Promise<void>;
  public abstract reset(params?: {
    includeUnmanaged?: boolean;
  }): Promise<InstallerResult>;
  protected abstract createConfig(): Promise<void>;
  public abstract isClientPresent(): Promise<boolean>;
  public abstract isClientConfigPresent(): Promise<boolean>;
}

export type Installable = {
  name: string;
  sseURL: string;
  streamableURL: string;
};
