import { AbstractClient } from "@director.run/mcp/client/abstract-client";
import { HTTPClient } from "@director.run/mcp/client/http-client";
import { StdioClient } from "@director.run/mcp/client/stdio-client";
import type { OAuthProviderFactory } from "@director.run/mcp/oauth/oauth-provider-factory";
import {
  ProxyServer,
  type ProxyTarget,
} from "@director.run/mcp/proxy/proxy-server";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { Telemetry } from "@director.run/utilities/telemetry";
import {
  PROMPT_MANAGER_TARGET_NAME,
  type Prompt,
  PromptManager,
} from "../capabilities/prompt-manager";
import { Config } from "../config";
import { getSSEPathForProxy, getStreamablePathForProxy } from "../helpers";
import {
  type WorkspaceHTTPTarget,
  WorkspaceHTTPTargetSchema,
  type WorkspaceParams,
  type WorkspacePlainObject,
  WorkspaceSchema,
  type WorkspaceStdioTarget,
  WorkspaceStdioTargetSchema,
  type WorkspaceTarget,
  WorkspaceTargetSchema,
} from "./workspace-schema";

// Re-export all types and schemas for backward compatibility
export type {
  WorkspaceHTTPTarget,
  WorkspaceStdioTarget,
  WorkspaceTarget,
  WorkspaceParams,
  WorkspacePlainObject,
};
export {
  WorkspaceHTTPTargetSchema,
  WorkspaceStdioTargetSchema,
  WorkspaceTargetSchema,
  WorkspaceSchema,
};

export class Workspace extends ProxyServer {
  private _config?: Config;
  private _telemetry?: Telemetry;
  private _oAuthHandler?: OAuthProviderFactory;
  private _description?: string;
  private _name: string; // TODO: change to 'displayName'

  constructor(
    attributes: WorkspaceParams,
    params?: {
      oAuthHandler?: OAuthProviderFactory;
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
    await this.sendListChangedEvents();

    return newPrompt;
  }

  public async removePrompt(promptName: string) {
    const promptManager = (await super.getTarget(
      PROMPT_MANAGER_TARGET_NAME,
    )) as PromptManager;
    await promptManager.removePromptEntry(promptName);

    await this.persistToConfig();
    await this.sendListChangedEvents();

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
    await this.sendListChangedEvents();

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
      oAuthHandler?: OAuthProviderFactory;
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
      await this._config.workspaces.update(this.id, await this.toConfig());
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
  oAuthHandler?: OAuthProviderFactory;
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
          headers: target.headers,
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
