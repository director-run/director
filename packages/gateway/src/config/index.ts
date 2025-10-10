import fs from "fs";
import { existsSync } from "node:fs";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import _ from "lodash";
import slugify from "slugify";
import YAML from "yaml";
import { z } from "zod";

import {
  type WorkspaceParams,
  WorkspaceSchema,
} from "../workspaces/workspace-schema";
import { TypedStore } from "./typed-store";

export const databaseAttributesSchema = {
  version: z.string().optional(),
  workspaces: z.array(WorkspaceSchema).default([]),
};

export abstract class Config extends TypedStore<
  typeof databaseAttributesSchema
> {
  abstract purge(): Promise<void>;

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
    await this.set("workspaces", workspaces);
    return proxy;
  }

  async unsetWorkspace(id: string): Promise<void> {
    const workspaces = await this.getWorkspaces();
    await this.set("workspaces", _.reject(workspaces, { id }));
  }

  async countWorkspaces(): Promise<number> {
    const workspaces = await this.getWorkspaces();
    return workspaces.length;
  }

  async getWorkspaces(): Promise<WorkspaceParams[]> {
    return (await this.get("workspaces")) || [];
  }
}

export class YAMLConfig extends Config {
  public readonly filePath: string;
  private defaultData: Record<string, unknown>;

  constructor(config: {
    filePath: string;
    defaultData: Record<string, unknown>;
  }) {
    super({ schema: databaseAttributesSchema });
    this.filePath = config.filePath;
    this.defaultData = config.defaultData;
  }
  async init() {
    if (!existsSync(this.filePath)) {
      await fs.promises.writeFile(
        this.filePath,
        YAML.stringify(this.defaultData),
      );
      await this.validateAndSetData(this.defaultData);
    } else {
      const data = await fs.promises.readFile(this.filePath, "utf8");
      await this.validateAndSetData(YAML.parse(data));
    }
  }

  async persist() {
    await fs.promises.writeFile(this.filePath, YAML.stringify(this.data));
  }

  async purge() {
    await fs.promises.writeFile(
      this.filePath,
      YAML.stringify(this.defaultData),
    );
    await this.validateAndSetData(this.defaultData);
  }
  static async connect(filePath: string): Promise<YAMLConfig> {
    const db = new YAMLConfig({
      filePath,
      defaultData: defaultConfiguration(),
    });
    await db.init();
    return db;
  }
}

function defaultConfiguration(): Record<string, unknown> {
  return {
    version: "1.0.0",
    workspaces: [],
  };
}

function slugifyName(name: string): string {
  return slugify(name, { lower: true, strict: true, trim: true });
}
