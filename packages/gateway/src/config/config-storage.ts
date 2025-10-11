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

  constructor(params?: { data?: Record<string, unknown> }) {
    this.data = { ...params?.data };
  }

  init(): Promise<void> {
    return Promise.resolve();
  }

  persist(): Promise<void> {
    return Promise.resolve();
  }

  purge(): Promise<void> {
    this.data = {};
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

  constructor(params: {
    filePath: string;
  }) {
    this.filePath = params.filePath;
  }

  async init(): Promise<void> {
    if (existsSync(this.filePath)) {
      const fileContent = await fs.promises.readFile(this.filePath, "utf8");
      this.data = YAML.parse(fileContent);
    }
  }

  async persist(): Promise<void> {
    await fs.promises.writeFile(this.filePath, YAML.stringify(this.data));
  }

  async purge(): Promise<void> {
    this.data = {};
    await this.persist();
  }

  getData(): Record<string, unknown> {
    return this.data;
  }

  setData(data: Record<string, unknown>): void {
    this.data = data;
  }
}
