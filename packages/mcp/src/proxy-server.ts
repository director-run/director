import {
  AppError,
  ErrorCode,
  isAppErrorWithCode,
} from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import type {
  ProxyServerAttributes,
  ProxyTargetAttributes,
} from "@director.run/utilities/schema";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import * as eventsource from "eventsource";
import _ from "lodash";
import packageJson from "../package.json";
import { HTTPClient } from "./client/http-client";
import { StdioClient } from "./client/stdio-client";
import { setupPromptHandlers } from "./handlers/prompts-handler";
import { setupResourceTemplateHandlers } from "./handlers/resource-templates-handler";
import { setupResourceHandlers } from "./handlers/resources-handler";
import { setupToolHandlers } from "./handlers/tools-handler";
import { OAuthHandler } from "./oauth/oauth-provider-factory";

global.EventSource = eventsource.EventSource;

const logger = getLogger(`ProxyServer`);

export class ProxyServer extends Server {
  private _targets: (HTTPClient | StdioClient)[];
  private _oAuthHandler?: OAuthHandler;
  public readonly attributes: ProxyServerAttributes;

  public get targets(): (HTTPClient | StdioClient)[] {
    return this._targets;
  }

  constructor(
    attributes: ProxyServerAttributes,
    params?: {
      oAuthHandler?: OAuthHandler;
    },
  ) {
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
    this.attributes = attributes;
    this._oAuthHandler = params?.oAuthHandler;

    for (const server of this.attributes.servers) {
      const target = createClientForTarget(server, this._oAuthHandler);
      this._targets.push(target);
    }

    setupToolHandlers(this, this.targets, this.attributes.addToolPrefix);
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

  public async getTarget(
    targetName: string,
  ): Promise<HTTPClient | StdioClient> {
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

  public getAllTargets(): (HTTPClient | StdioClient)[] {
    return this.targets;
  }

  public async addTarget(
    target: ProxyTargetAttributes,
    attribs: { throwOnError: boolean } = { throwOnError: false },
  ): Promise<HTTPClient | StdioClient> {
    const existingTarget = this.targets.find(
      (t) => t.name.toLocaleLowerCase() === target.name.toLocaleLowerCase(),
    );
    if (existingTarget) {
      throw new AppError(
        ErrorCode.DUPLICATE,
        `Target ${target.name} already exists`,
      );
    }
    const newTarget = createClientForTarget(target, this._oAuthHandler);

    try {
      await newTarget.connectToTarget({ throwOnError: attribs.throwOnError });
    } catch (error) {
      if (isAppErrorWithCode(error, ErrorCode.UNAUTHORIZED)) {
        // Oauth error, so we supress the exception
      } else {
        throw error;
      }
    }

    this.attributes.servers.push(target);
    this.targets.push(newTarget);

    return newTarget;
    // TODO: send list changed events. need client to support this first
    // this.sendToolListChanged();
    // this.sendPromptListChanged();
    // this.sendResourceListChanged();
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
    this.attributes.servers = this.attributes.servers.filter(
      (t) => t.name.toLocaleLowerCase() !== targetName.toLocaleLowerCase(),
    );

    _.remove(this.targets, (t) => t.name === targetName);

    // TODO: send list changed events. need client to support this first
    // this.sendToolListChanged();
    // this.sendPromptListChanged();
    // this.sendResourceListChanged();
  }

  public update(
    attributes: Partial<Pick<ProxyServerAttributes, "name" | "description">>,
  ) {
    const { name, description } = attributes;
    if (name) {
      this.attributes.name = name;
    }
    if (description && description !== this.attributes.description) {
      this.attributes.description = description;
    }
  }

  public toPlainObject() {
    return {
      ...this.attributes,
      targets: this.targets.map((target) => target.toPlainObject()),
    };
  }

  get id() {
    return this.attributes.id;
  }

  async close(): Promise<void> {
    logger.info({ message: `shutting down`, proxyId: this.id });
    await Promise.all(this.targets.map((target) => target.close()));
    await super.close();
  }
}

export function createClientForTarget(
  target: ProxyTargetAttributes,
  oAuthHandler?: OAuthHandler,
) {
  switch (target.transport.type) {
    case "http":
      return new HTTPClient({
        url: target.transport.url,
        name: target.name,
        oAuthHandler,
      });
    case "stdio":
      return new StdioClient({
        name: target.name,
        command: target.transport.command,
        args: target.transport.args,
        env: {
          ...(process.env as Record<string, string>),
          ...target.transport.env,
        },
      });
  }
}
