import {
  AppError,
  ErrorCode,
  isAppErrorWithCode,
} from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import * as eventsource from "eventsource";
import _ from "lodash";
import packageJson from "../../package.json";
import type {
  AbstractClient,
  AbstractClientParams,
} from "../client/abstract-client";
import { setupPromptHandlers } from "./handlers/prompts-handler";
import { setupResourceTemplateHandlers } from "./handlers/resource-templates-handler";
import { setupResourceHandlers } from "./handlers/resources-handler";
import { setupToolHandlers } from "./handlers/tools-handler";

global.EventSource = eventsource.EventSource;

const logger = getLogger(`ProxyServer`);

export type ProxyServerAttributes = {
  id: string;
  name: string;
  description?: string;
  servers: AbstractClient[];
};

export class ProxyServer extends Server {
  private _targets: AbstractClient[];
  private _id: string;
  private _name: string;
  private _description?: string | null;
  private _addToolPrefix?: boolean;

  constructor(attributes: ProxyServerAttributes) {
    super(
      {
        name: attributes.name,
        version: packageJson.version,
      },
      {
        capabilities: {
          prompts: {},
          resources: { subscribe: true },
          tools: { listChanged: true },
        },
      },
    );
    this._targets = [];
    this._id = attributes.id;
    this._name = attributes.name;
    this._description = attributes.description;

    for (const server of attributes.servers) {
      this._targets.push(server);
    }

    setupToolHandlers(this);
    setupPromptHandlers(this, this._targets);
    setupResourceHandlers(this, this._targets);
    setupResourceTemplateHandlers(this, this._targets);
  }

  public async connectTargets(
    { throwOnError } = { throwOnError: false },
  ): Promise<void> {
    for (const target of this.targets) {
      await target.connectToTarget({ throwOnError });
    }
  }

  public async getTarget(targetName: string): Promise<AbstractClient> {
    const target = this.targets.find(
      (t) => t.name.toLocaleLowerCase() === targetName.toLocaleLowerCase(),
    );
    if (!target) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Target ${targetName} does not exists`,
      );
    }
    return target;
  }

  public get targets(): AbstractClient[] {
    return this._targets;
  }

  public get name() {
    return this._name;
  }

  public get description() {
    return this._description;
  }

  public async addTarget(
    target: AbstractClient,
    attribs: { throwOnError: boolean } = { throwOnError: false },
  ): Promise<AbstractClient> {
    const existingTarget = this.targets.find(
      (t) => t.name.toLocaleLowerCase() === target.name.toLocaleLowerCase(),
    );

    if (existingTarget) {
      throw new AppError(
        ErrorCode.DUPLICATE,
        `Target ${target.name} already exists`,
      );
    }

    try {
      await target.connectToTarget({ throwOnError: attribs.throwOnError });
    } catch (error) {
      if (isAppErrorWithCode(error, ErrorCode.UNAUTHORIZED)) {
        // Oauth error, so we supress the exception
      } else {
        throw error;
      }
    }

    this.targets.push(target);

    return target;
    // TODO: send list changed events. need client to support this first
    // this.sendToolListChanged();
    // this.sendPromptListChanged();
    // this.sendResourceListChanged();
  }

  public async updateTarget(
    targetName: string,

    attributes: Partial<
      Pick<AbstractClientParams, "toolPrefix" | "disabledTools" | "disabled">
    >,
  ) {
    const target = await this.getTarget(targetName);

    if (attributes.toolPrefix !== undefined) {
      target.toolPrefix = attributes.toolPrefix;
    }
    if (attributes.disabledTools !== undefined) {
      target.disabledTools = attributes.disabledTools;
    }
    if (attributes.disabled !== undefined) {
      await target.setDisabled(attributes.disabled);
    }

    return target;
  }

  public async removeTarget(targetName: string) {
    const existingTarget = this.targets.find(
      (t) => t.name.toLocaleLowerCase() === targetName.toLocaleLowerCase(),
    );
    if (!existingTarget) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `Target ${targetName} does not exists`,
      );
    }
    await existingTarget.close();

    _.remove(
      this.targets,
      (t) => t.name.toLocaleLowerCase() === targetName.toLocaleLowerCase(),
    );

    return existingTarget;
    // TODO: send list changed events. need client to support this first
    // this.sendToolListChanged();
    // this.sendPromptListChanged();
    // this.sendResourceListChanged();
  }

  public update(
    attributes: Partial<Pick<ProxyServerAttributes, "name" | "description">>,
  ) {
    const { name, description } = attributes;
    if (name !== undefined && name !== this._name) {
      if (name.trim() === "") {
        throw new AppError(ErrorCode.BAD_REQUEST, `Name cannot be empty`);
      }

      this._name = name;
    }
    if (description !== undefined && description !== this._description) {
      this._description = description;
    }
  }

  get id() {
    return this._id;
  }

  get addToolPrefix() {
    return this._addToolPrefix;
  }

  async close(): Promise<void> {
    logger.info({ message: `shutting down`, proxyId: this.id });
    await Promise.all(this.targets.map((target) => target.close()));
    await super.close();
  }
}
