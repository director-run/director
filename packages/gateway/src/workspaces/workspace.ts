import { AbstractClient } from "@director.run/mcp/client/abstract-client";
import {
  HTTPClient,
  type HTTPClientPlainObject,
  HTTPClientSchema,
} from "@director.run/mcp/client/http-client";
import {
  StdioClient,
  type StdioClientPlainObject,
  StdioClientSchema,
} from "@director.run/mcp/client/stdio-client";
import type { OAuthHandler } from "@director.run/mcp/oauth/oauth-provider-factory";
import {
  ProxyServer,
  type ProxyTarget,
} from "@director.run/mcp/proxy/proxy-server";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import {
  optionalStringSchema,
  requiredStringSchema,
} from "@director.run/utilities/schema";
import { Telemetry } from "@director.run/utilities/telemetry";
import { z } from "zod";
import {
  PROMPT_MANAGER_TARGET_NAME,
  type Prompt,
  PromptManager,
  PromptSchema,
} from "../capabilities/prompt-manager";
import { Config } from "../config";
import { getSSEPathForProxy, getStreamablePathForProxy } from "../helpers";

export const WorkspaceHTTPTargetSchema = HTTPClientSchema.extend({
  type: z.literal("http"),
});

export type WorkspaceHTTPTarget = z.infer<typeof WorkspaceHTTPTargetSchema>;

export const WorkspaceStdioTargetSchema = StdioClientSchema.extend({
  type: z.literal("stdio"),
});

export type WorkspaceStdioTarget = z.infer<typeof WorkspaceStdioTargetSchema>;

const WorkspaceTargetSchema = z.union([
  WorkspaceHTTPTargetSchema,
  WorkspaceStdioTargetSchema,
]);

export type WorkspaceTarget = z.infer<typeof WorkspaceTargetSchema>;

export const WorkspaceSchema = z.object({
  id: requiredStringSchema,
  name: requiredStringSchema,
  description: optionalStringSchema,
  prompts: z.array(PromptSchema).optional(),
  servers: z.array(WorkspaceTargetSchema),
});

export type WorkspaceParams = z.infer<typeof WorkspaceSchema>;

export type WorkspacePlainObject = Omit<WorkspaceParams, "servers"> & {
  servers: (HTTPClientPlainObject | StdioClientPlainObject)[];
  paths: {
    streamable: string;
    sse: string;
  };
};

export class Workspace extends ProxyServer {
  private _config?: Config;
  private _telemetry?: Telemetry;
  private _oAuthHandler?: OAuthHandler;
  private _description?: string;
  private _name: string; // TODO: change to 'displayName'

  constructor(
    attributes: WorkspaceParams,
    params?: {
      oAuthHandler?: OAuthHandler;
      config?: Config;
      telemetry?: Telemetry;
    },
  ) {
    super({
      id: attributes.id,
      servers: [
        ...attributes.servers.map((server) =>
          createClientForTarget({
            target: server,
            oAuthHandler: params?.oAuthHandler,
          }),
        ),
        new PromptManager({
          prompts: attributes.prompts,
        }),
      ],
    });

    this._name = attributes.name;
    this._description = attributes.description;
    this._oAuthHandler = params?.oAuthHandler;
    this._config = params?.config;
    this._telemetry = params?.telemetry;
  }

  public get description() {
    return this._description;
  }

  get name() {
    return this._name;
  }

  public async addTarget(
    server: WorkspaceTarget | ProxyTarget,
    params: { throwOnError: boolean } = { throwOnError: true },
  ): Promise<ProxyTarget> {
    await this.trackEvent("server_added");

    let target: ProxyTarget;

    if (server instanceof AbstractClient) {
      target = server;
    } else {
      target = createClientForTarget({
        target: server,
        oAuthHandler: this._oAuthHandler,
      });
    }

    await super.addTarget(target, params);
    await this.persistToConfig();

    return target;
  }

  public async removeTarget(serverName: string): Promise<ProxyTarget> {
    await this.trackEvent("server_removed");
    const removedTarget = await super.removeTarget(serverName);

    await this.persistToConfig();
    return removedTarget;
  }

  public async updateTarget(
    serverName: string,
    attributes: Partial<Pick<WorkspaceTarget, "toolPrefix" | "disabledTools">>,
  ): Promise<ProxyTarget> {
    const target = await super.updateTarget(serverName, attributes);
    await this.persistToConfig();

    return target;
  }

  public async addPrompt(prompt: Prompt) {
    const promptManager = (await super.getTarget(
      PROMPT_MANAGER_TARGET_NAME,
    )) as PromptManager;
    const newPrompt = await promptManager.addPromptEntry(prompt);
    await this.persistToConfig();
    return newPrompt;
  }

  public async removePrompt(promptName: string) {
    const promptManager = (await super.getTarget(
      PROMPT_MANAGER_TARGET_NAME,
    )) as PromptManager;
    await promptManager.removePromptEntry(promptName);
    await this.persistToConfig();

    return true;
  }

  public async updatePrompt(
    promptName: string,
    prompt: Partial<Pick<Prompt, "title" | "description" | "body">>,
  ) {
    const promptManager = (await super.getTarget(
      PROMPT_MANAGER_TARGET_NAME,
    )) as PromptManager;
    const updatedPrompt = await promptManager.updatePrompt(promptName, prompt);
    await this.persistToConfig();

    return updatedPrompt;
  }

  public async listPrompts(): Promise<Prompt[]> {
    const promptManager = (await super.getTarget(
      PROMPT_MANAGER_TARGET_NAME,
    )) as PromptManager;
    return promptManager.prompts;
  }

  public async update(
    attributes: Partial<Pick<WorkspaceParams, "name" | "description">>,
  ) {
    await this.trackEvent("proxy_updated");

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
    await this.persistToConfig();

    return this;
  }

  static async fromConfig(
    attributes: WorkspaceParams,
    params?: {
      oAuthHandler?: OAuthHandler;
      config?: Config;
      telemetry?: Telemetry;
    },
  ): Promise<Workspace> {
    const workspace = new Workspace(attributes, {
      oAuthHandler: params?.oAuthHandler,
      config: params?.config,
      telemetry: params?.telemetry,
    });
    await workspace.connectTargets();
    return workspace;
  }

  private async trackEvent(event: string): Promise<void> {
    if (this._telemetry) {
      await this._telemetry.trackEvent(event);
    }
  }

  private async persistToConfig(): Promise<void> {
    if (this._config) {
      await this._config.setWorkspace(this.id, await this.toConfig());
    }
  }

  private async toConfig(): Promise<WorkspaceParams> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      prompts: await this.listPrompts(),
      servers: await Promise.all(
        this.targets
          .filter(
            (target) =>
              target instanceof HTTPClient || target instanceof StdioClient,
          )
          .map((target) => target.toPlainObject()),
      ),
    };
  }

  public async toPlainObject(): Promise<WorkspacePlainObject> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      prompts: await this.listPrompts(),
      servers: await Promise.all(
        this.targets
          .filter(
            (target) =>
              target instanceof HTTPClient || target instanceof StdioClient,
          )
          .map((target) =>
            target.toPlainObject({
              connectionInfo: true,
            }),
          ),
      ),
      paths: {
        streamable: getStreamablePathForProxy(this.id),
        sse: getSSEPathForProxy(this.id),
      },
    };
  }
}

function createClientForTarget(params: {
  target: WorkspaceTarget;
  oAuthHandler?: OAuthHandler;
}) {
  const { target, oAuthHandler } = params;
  switch (target.type) {
    case "http":
      return new HTTPClient(
        {
          url: target.url,
          name: target.name,
          source: target.source,
          toolPrefix: target.toolPrefix,
          disabledTools: target.disabledTools,
          disabled: target.disabled,
        },
        { oAuthHandler },
      );
    case "stdio":
      return new StdioClient({
        name: target.name,
        command: target.command,
        args: target.args,
        env: target.env,
        source: target.source,
        toolPrefix: target.toolPrefix,
        disabledTools: target.disabledTools,
        disabled: target.disabled,
      });
  }
}
