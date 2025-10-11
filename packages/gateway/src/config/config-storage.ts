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
  private seedData: Record<string, unknown>;

  constructor(params?: { seedData?: Record<string, unknown> }) {
    this.seedData = params?.seedData ?? {};
    this.data = { ...this.seedData };
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
    this.data = { ...this.seedData };
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
  private seedData: Record<string, unknown>;

  constructor(params: {
    filePath: string;
    seedData: Record<string, unknown>;
  }) {
    this.filePath = params.filePath;
    this.seedData = params.seedData;
  }

  async init(): Promise<void> {
    if (!existsSync(this.filePath)) {
      await fs.promises.writeFile(this.filePath, YAML.stringify(this.seedData));
      this.data = { ...this.seedData };
    } else {
      const fileContent = await fs.promises.readFile(this.filePath, "utf8");
      this.data = YAML.parse(fileContent);
    }
  }

  async persist(): Promise<void> {
    await fs.promises.writeFile(this.filePath, YAML.stringify(this.data));
  }

  async purge(): Promise<void> {
    await fs.promises.writeFile(this.filePath, YAML.stringify(this.seedData));
    this.data = { ...this.seedData };
  }

  getData(): Record<string, unknown> {
    return this.data;
  }

  setData(data: Record<string, unknown>): void {
    this.data = data;
  }
}
