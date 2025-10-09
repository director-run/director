import fs from "fs";
import { existsSync } from "node:fs";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import _ from "lodash";
import slugify from "slugify";
import YAML from "yaml";
import { ZodError } from "zod";
import { z } from "zod";

import { type WorkspaceParams, WorkspaceSchema } from "../workspaces/workspace";

export const databaseAttributesSchema = z.object({
  version: z.string().optional(),
  workspaces: z.array(WorkspaceSchema),
});

export type ConfigurationData = z.infer<typeof databaseAttributesSchema>;

export abstract class Config {
  protected _data?: ConfigurationData;

  protected abstract init(): Promise<void>;
  protected abstract readData(): Promise<ConfigurationData>;
  protected abstract writeData(data: ConfigurationData): Promise<void>;

  async createWorkspace(
    proxy: Omit<WorkspaceParams, "id">,
  ): Promise<WorkspaceParams> {
    const workspaceId = slugifyName(proxy.name);
    const store = await this.readData();

    const existingWorkspace = _.find(store.workspaces, { id: workspaceId });
    if (existingWorkspace) {
      throw new AppError(
        ErrorCode.DUPLICATE,
        "Workspace with this name already exists",
      );
    }

    return this.setWorkspace(workspaceId, {
      id: workspaceId,
      ...proxy,
      servers: _.map(proxy.servers || [], (s) => ({
        ...s,
        name: slugifyName(s.name),
      })),
    });
  }

  async getWorkspace(id: string): Promise<WorkspaceParams> {
    const store = await this.readData();
    const proxy = _.find(store.workspaces, { id });
    if (!proxy) {
      throw new Error("Workspace not found");
    }
    return proxy;
  }

  async setWorkspace(
    id: string,
    proxy: WorkspaceParams,
  ): Promise<WorkspaceParams> {
    if (proxy.id !== id) {
      throw new Error("Id mismatch");
    }
    const store = await this.readData();
    const proxyIndex = _.findIndex(store.workspaces, { id });
    if (proxyIndex === -1) {
      store.workspaces.push(proxy);
    } else {
      store.workspaces[proxyIndex] = proxy;
    }
    await this.writeData(store);
    return proxy;
  }

  async unsetWorkspace(id: string): Promise<void> {
    const store = await this.readData();
    store.workspaces = _.reject(store.workspaces, { id });
    await this.writeData(store);
  }

  async countWorkspaces(): Promise<number> {
    const store = await this.readData();
    return store.workspaces.length;
  }

  async allWorkspaces(): Promise<WorkspaceParams[]> {
    const store = await this.readData();
    return store.workspaces;
  }

  async purge(): Promise<void> {
    await this.writeData(defaultConfiguration());
  }
}

export class YAMLConfig extends Config {
  public readonly filePath: string;

  constructor(filePath: string) {
    super();
    this.filePath = filePath;
  }

  static async connect(filePath: string): Promise<YAMLConfig> {
    const db = new YAMLConfig(filePath);
    await db.init();
    return db;
  }

  async init() {
    if (!existsSync(this.filePath)) {
      await this.writeData(defaultConfiguration());
    } else {
      const data = await fs.promises.readFile(this.filePath, "utf8");
      try {
        this._data = databaseAttributesSchema.parse(YAML.parse(data));
      } catch (e) {
        if (e instanceof ZodError) {
          throw new AppError(
            ErrorCode.INVALID_CONFIGURATION,
            "Invalid configuration file",
            {
              filePath: this.filePath,
              parseErrors: e.errors,
            },
          );
        } else {
          throw e;
        }
      }
    }
  }

  async readData(): Promise<ConfigurationData> {
    if (!this._data) {
      await this.init();
    }
    return _.cloneDeep(this._data) as ConfigurationData;
  }

  async writeData(data: ConfigurationData): Promise<void> {
    await fs.promises.writeFile(this.filePath, YAML.stringify(data));
    this._data = _.cloneDeep(data);
  }
}

function defaultConfiguration(): ConfigurationData {
  return {
    version: "1.0.0",
    workspaces: [],
  };
}

function slugifyName(name: string): string {
  return slugify(name, { lower: true, strict: true, trim: true });
}
