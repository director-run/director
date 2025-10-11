import { AppError, ErrorCode } from "@director.run/utilities/error";
import _ from "lodash";
import slugify from "slugify";
import { z } from "zod";

import {
  type WorkspaceParams,
  WorkspaceSchema,
} from "../workspaces/workspace-schema";
import { Config as BaseConfig, YamlStorage } from "./base-config";

export const databaseAttributesSchema = {
  version: z.string().optional(),
  workspaces: z.array(WorkspaceSchema).default([]),
  "server.port": z.number().min(0).default(3673),
  "server.allowedOrigins": z
    .array(z.union([z.string(), z.instanceof(RegExp)]))
    .default([/^https?:\/\/localhost(:\d+)?$/]),
  "registry.url": z.string().default("https://registry.director.run"),
  "registry.apiKey": z.string().optional(),
  "telemetry.writeKey": z.string().default(""),
  "telemetry.enabled": z.boolean().default(false),
  oauth: z.object({
    storage: z.literal("disk").default("disk"),
    tokenDirectory: z.string().default("./tokens"),
  }),
};

export class Config extends BaseConfig<typeof databaseAttributesSchema> {
  public readonly workspaces: WorkspacesConfig;
  public readonly filePath: string;

  private constructor(config: {
    filePath: string;
    defaultData: Record<string, unknown>;
  }) {
    const storage = new YamlStorage({
      filePath: config.filePath,
      defaultData: config.defaultData,
    });
    super({
      schema: databaseAttributesSchema,
      storage,
    });
    this.filePath = config.filePath;
    this.workspaces = new WorkspacesConfig(this);
  }

  static async create(filePath: string): Promise<Config> {
    const config = new Config({
      filePath,
      defaultData: {
        version: "1.0.0",
        workspaces: [],
      },
    });
    await config.init();
    return config;
  }
}

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

function slugifyName(name: string): string {
  return slugify(name, { lower: true, strict: true, trim: true });
}
