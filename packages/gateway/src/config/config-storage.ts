import fs from "fs";
import { existsSync } from "node:fs";
import YAML from "yaml";

export interface ConfigStorage {
  init(): Promise<void>;
  persist(): Promise<void>;
  purge(): Promise<void>;
  getData(): Record<string, unknown>;
  setData(data: Record<string, unknown>): void;
}

export class InMemoryConfigStorage implements ConfigStorage {
  private data: Record<string, unknown>;
  private defaultData: Record<string, unknown>;

  constructor(params?: { data?: Record<string, unknown> }) {
    this.defaultData = params?.data ?? {};
    this.data = { ...this.defaultData };
  }

  init(): Promise<void> {
    // No initialization needed for memory storage
    return Promise.resolve();
  }

  persist(): Promise<void> {
    // No persistence needed for memory storage
    return Promise.resolve();
  }

  purge(): Promise<void> {
    this.data = { ...this.defaultData };
    return Promise.resolve();
  }

  getData(): Record<string, unknown> {
    return this.data;
  }

  setData(data: Record<string, unknown>): void {
    this.data = data;
  }
}

export class YamlConfigStorage implements ConfigStorage {
  public readonly filePath: string;
  private data: Record<string, unknown> = {};
  private defaultData: Record<string, unknown>;

  constructor(params: {
    filePath: string;
    defaultData: Record<string, unknown>;
  }) {
    this.filePath = params.filePath;
    this.defaultData = params.defaultData;
  }

  async init(): Promise<void> {
    if (!existsSync(this.filePath)) {
      await fs.promises.writeFile(
        this.filePath,
        YAML.stringify(this.defaultData),
      );
      this.data = { ...this.defaultData };
    } else {
      const fileContent = await fs.promises.readFile(this.filePath, "utf8");
      this.data = YAML.parse(fileContent);
    }
  }

  async persist(): Promise<void> {
    await fs.promises.writeFile(this.filePath, YAML.stringify(this.data));
  }

  async purge(): Promise<void> {
    await fs.promises.writeFile(
      this.filePath,
      YAML.stringify(this.defaultData),
    );
    this.data = { ...this.defaultData };
  }

  getData(): Record<string, unknown> {
    return this.data;
  }

  setData(data: Record<string, unknown>): void {
    this.data = data;
  }
}
