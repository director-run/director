import { AppError, ErrorCode } from "@director.run/utilities/error";
import { readJSONFile } from "@director.run/utilities/json";
import { type Logger, getLogger } from "@director.run/utilities/logger";
const CONFIG_KEY_PREFIX = "director__";

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
      throw new AppError(
        ErrorCode.FILE_NOT_FOUND,
        `${this.name} config file not found at ${this.configPath}`,
        {
          name: this.name,
          configPath: this.configPath,
        },
      );
    }

    this.config = await readJSONFile<T>(this.configPath);
    this.isInitialized = true;
  }

  public async getStatus(): Promise<{
    name: string;
    present: boolean;
    configPresent: boolean;
  }> {
    return {
      name: this.name,
      present: await this.isClientPresent(),
      configPresent: await this.isClientConfigPresent(),
    };
  }

  protected createServerConfigKey(name: string) {
    return `${CONFIG_KEY_PREFIX}${name}`;
  }

  protected isManagedConfigKey(key: string) {
    return key.startsWith(CONFIG_KEY_PREFIX);
  }

  public abstract install(attributes: {
    name: string;
    url: string;
  }): Promise<void>;
  public abstract uninstall(name: string): Promise<void>;
  public abstract list(): Promise<Array<{ name: string; url: string }>>;
  public abstract openConfig(): Promise<void>;
  public abstract isInstalled(name: string): Promise<boolean>;
  public abstract restart(): Promise<void>;
  public abstract reload(name: string): Promise<void>;
  public abstract reset(): Promise<void>;
  public abstract isClientPresent(): Promise<boolean>;
  public abstract isClientConfigPresent(): Promise<boolean>;
}

export type Installable = {
  name: string;
  url: string;
};
