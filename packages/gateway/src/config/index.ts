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

export class WorkspacesConfig {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async create(
    workspace: Omit<WorkspaceParams, "id">,
  ): Promise<WorkspaceParams> {
    const workspaceId = slugifyName(workspace.name);
    const workspaces = await this.all();

    const existingWorkspace = _.find(workspaces, { id: workspaceId });
    if (existingWorkspace) {
      throw new AppError(
        ErrorCode.DUPLICATE,
        "Workspace with this name already exists",
      );
    }

    return this.update(workspaceId, {
      id: workspaceId,
      ...workspace,
      servers: _.map(workspace.servers || [], (s) => ({
        ...s,
        name: slugifyName(s.name),
      })),
    });
  }

  async getWorkspace(id: string): Promise<WorkspaceParams> {
    const workspaces = await this.all();
    const workspace = _.find(workspaces, { id });
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    return workspace;
  }

  async update(
    id: string,
    workspace: WorkspaceParams,
  ): Promise<WorkspaceParams> {
    if (workspace.id !== id) {
      throw new Error("Id mismatch");
    }
    const workspaces = await this.all();
    const workspaceIndex = _.findIndex(workspaces, { id });
    if (workspaceIndex === -1) {
      workspaces.push(workspace);
    } else {
      workspaces[workspaceIndex] = workspace;
    }
    await this.config.set("workspaces", workspaces);
    return workspace;
  }

  async remove(id: string): Promise<void> {
    const workspaces = await this.all();
    await this.config.set("workspaces", _.reject(workspaces, { id }));
  }

  async count(): Promise<number> {
    const workspaces = await this.all();
    return workspaces.length;
  }

  async all(): Promise<WorkspaceParams[]> {
    return (await this.config.get("workspaces")) || [];
  }
}

export abstract class Config extends TypedStore<
  typeof databaseAttributesSchema
> {
  public readonly workspaces: WorkspacesConfig;

  constructor(config: { schema: typeof databaseAttributesSchema }) {
    super({ schema: config.schema });
    this.workspaces = new WorkspacesConfig(this);
  }

  abstract purge(): Promise<void>;
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
      this.validateAndSetData(this.defaultData);
    } else {
      const data = await fs.promises.readFile(this.filePath, "utf8");
      this.validateAndSetData(YAML.parse(data));
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
    const config = new YAMLConfig({
      filePath,
      defaultData: defaultConfiguration(),
    });
    await config.init();
    return config;
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
