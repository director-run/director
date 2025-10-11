import { AppError, ErrorCode } from "@director.run/utilities/error";
import _ from "lodash";
import slugify from "slugify";
import { z } from "zod";

import {
  type WorkspaceParams,
  WorkspaceSchema,
} from "../workspaces/workspace-schema";
import { ConfigBase } from "./config-base";
import { type ConfigStorage, YamlConfigStorage } from "./config-storage";

export class Config extends ConfigBase<typeof configSchema> {
  public readonly workspaces: WorkspacesConfig;

  private constructor(params: {
    storage: ConfigStorage;
  }) {
    super({
      schema: configSchema,
      storage: params.storage,
    });
    this.workspaces = new WorkspacesConfig(this);
  }

  get filePath(): string {
    return (this.storage as YamlConfigStorage).filePath;
  }

  static async createFileBasedConfig(filePath: string): Promise<Config> {
    const storage = new YamlConfigStorage({
      filePath: filePath,
      seedData: {
        version: "1.0.0",
        workspaces: [],
      },
    });
    const config = new Config({
      storage,
    });
    await config.init();
    return config;
  }
}

class WorkspacesConfig {
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

const configSchema = {
  version: z.string().default("1.0.0"),
  workspaces: z.array(WorkspaceSchema).default([]),
  "server.port": z.number().min(0).default(3673),
  "registry.url": z.string().default("https://registry.director.run"),
  "registry.apiKey": z.string().optional(),
  "telemetry.writeKey": z.string().default(""),
  "telemetry.enabled": z.boolean().default(false),
  oauth: z
    .object({
      storage: z.literal("disk"),
      tokenDirectory: z.string(),
    })
    .default({
      storage: "disk",
      tokenDirectory: "./tokens",
    }),
};
