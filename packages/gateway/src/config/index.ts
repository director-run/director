import { whiteBold } from "@director.run/utilities/cli/colors";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import _ from "lodash";
import slugify from "slugify";
import { z } from "zod";

import {
  type PlaybookParams,
  PlaybookSchema,
} from "../playbooks/playbook-schema";
import { ConfigBase } from "./config-base";
import {
  type ConfigStorage,
  InMemoryConfigStorage,
  YamlConfigStorage,
} from "./config-storage";

export class Config extends ConfigBase<typeof configSchema> {
  public readonly playbooks: PlaybooksConfig;

  private constructor(params: {
    storage: ConfigStorage;
    defaults: Record<string, unknown>;
  }) {
    super({
      schema: configSchema,
      storage: params.storage,
      defaults: params.defaults,
    });
    this.playbooks = new PlaybooksConfig(this);
  }

  static async createFileBasedConfig(params: {
    filePath: string;
    defaults: Record<string, unknown>;
  }): Promise<Config> {
    const config = new Config({
      storage: new YamlConfigStorage({ filePath: params.filePath }),
      defaults: params.defaults,
    });
    await config.init();
    return config;
  }

  static async createMemoryBasedConfig(params: {
    defaults: Record<string, unknown>;
  }): Promise<Config> {
    const config = new Config({
      storage: new InMemoryConfigStorage(),
      defaults: params.defaults,
    });
    await config.init();
    return config;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      defaults: this.defaults,
      storage: this.storage.toPlainObject(),
    };
  }

  prettyPrint(): void {
    console.log("*************************************************");
    console.log();
    console.log(whiteBold("STORAGE"));
    console.log(
      JSON.stringify(_.omit(this.storage.toPlainObject(), "data"), null, 2),
    );
    console.log();
    console.log(whiteBold("DEFAULTS"));
    console.log(JSON.stringify(this.defaults, null, 2));
    console.log();
    console.log("*************************************************");
  }
}

class PlaybooksConfig {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async create(playbook: Omit<PlaybookParams, "id">): Promise<PlaybookParams> {
    const playbookId = slugifyName(playbook.name);

    if (await this.config.find("playbooks", { id: playbookId })) {
      throw new AppError(
        ErrorCode.DUPLICATE,
        "Playbook with this name already exists",
      );
    }

    const newPlaybook = {
      id: playbookId,
      ...playbook,
      servers: _.map(playbook.servers || [], (s) => ({
        ...s,
        name: slugifyName(s.name),
      })),
    };

    await this.config.push("playbooks", newPlaybook);
    return newPlaybook;
  }

  async getPlaybook(id: string): Promise<PlaybookParams> {
    const playbooks = await this.all();
    const playbook = _.find(playbooks, { id });
    if (!playbook) {
      throw new Error("Playbook not found");
    }
    return playbook;
  }

  async update(id: string, playbook: PlaybookParams): Promise<PlaybookParams> {
    if (playbook.id !== id) {
      throw new Error("Id mismatch");
    }
    // Remove existing playbook with the same id (if any), then append the new one
    await this.config.remove("playbooks", { id });
    await this.config.push("playbooks", playbook);
    return playbook;
  }

  async remove(id: string): Promise<void> {
    await this.config.remove("playbooks", { id });
  }

  async count(): Promise<number> {
    const playbooks = await this.all();
    return playbooks.length;
  }

  async all(): Promise<PlaybookParams[]> {
    return (await this.config.get("playbooks")) || [];
  }
}

function slugifyName(name: string): string {
  return slugify(name, { lower: true, strict: true, trim: true });
}

const configSchema = {
  playbooks: z.array(PlaybookSchema).default([]),
} as const satisfies Record<string, z.ZodType>;
