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
  protected abstract init(): Promise<void>;
  protected abstract readData(): Promise<ConfigurationData>;
  protected abstract writeData(data: ConfigurationData): Promise<void>;

  async createWorkspace(
    proxy: Omit<WorkspaceParams, "id">,
  ): Promise<WorkspaceParams> {
    const workspaceId = slugifyName(proxy.name);
    const workspaces = await this.getWorkspaces();

    const existingWorkspace = _.find(workspaces, { id: workspaceId });
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
    const workspaces = await this.getWorkspaces();
    const proxy = _.find(workspaces, { id });
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
    const workspaces = await this.getWorkspaces();
    const proxyIndex = _.findIndex(workspaces, { id });
    if (proxyIndex === -1) {
      workspaces.push(proxy);
    } else {
      workspaces[proxyIndex] = proxy;
    }
    await this.setWorkspaces(workspaces);
    return proxy;
  }

  async unsetWorkspace(id: string): Promise<void> {
    const workspaces = await this.getWorkspaces();
    await this.setWorkspaces(_.reject(workspaces, { id }));
  }

  async countWorkspaces(): Promise<number> {
    const workspaces = await this.getWorkspaces();
    return workspaces.length;
  }

  async getWorkspaces(): Promise<WorkspaceParams[]> {
    const store = await this.readData();
    return store.workspaces;
  }

  async setWorkspaces(workspaces: WorkspaceParams[]): Promise<void> {
    await this.writeData({ workspaces });
  }

  async purge(): Promise<void> {
    await this.writeData(defaultConfiguration());
  }
}

export class YAMLConfig extends Config {
  public readonly filePath: string;
  protected _data?: ConfigurationData;

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
