import { HTTPClient } from "@director.run/mcp/client/http-client";
import { StdioClient } from "@director.run/mcp/client/stdio-client";
import type { OAuthHandler } from "@director.run/mcp/oauth/oauth-provider-factory";
import { ProxyServer } from "@director.run/mcp/proxy/proxy-server";
import { type ProxyTarget } from "@director.run/mcp/proxy/proxy-server";
import type { ProxyServerAttributes } from "@director.run/utilities/schema";
import type { ProxyTargetAttributes } from "@director.run/utilities/schema";
import { Telemetry } from "@director.run/utilities/telemetry";
import {
  PROMPT_MANAGER_TARGET_NAME,
  type Prompt,
  PromptManager,
} from "../capabilities/prompt-manager";
import { Config } from "../config";

export class Workspace extends ProxyServer {
  private _config?: Config;
  private _telemetry?: Telemetry;

  constructor(
    attributes: ProxyServerAttributes,
    params?: {
      oAuthHandler?: OAuthHandler;
      config?: Config;
      telemetry?: Telemetry;
    },
  ) {
    super(attributes, params);
    this._config = params?.config;
    this._telemetry = params?.telemetry;
  }

  public async addTarget(
    server: ProxyTargetAttributes,
    params: { throwOnError: boolean } = { throwOnError: true },
  ): Promise<ProxyTarget> {
    await this.trackEvent("server_added");
    const target = await super.addTarget(server, params);

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
    attributes: Partial<
      Pick<ProxyTargetAttributes, "toolPrefix" | "disabledTools">
    >,
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
    attributes: Partial<Pick<ProxyServerAttributes, "name" | "description">>,
  ) {
    await this.trackEvent("proxy_updated");
    await super.update(attributes);
    await this.persistToConfig();

    return this;
  }

  protected async addSystemTarget(target: ProxyTarget) {
    await super.addTarget(target);
  }

  static async fromConfig(
    config: ProxyServerAttributes,
    params?: {
      oAuthHandler?: OAuthHandler;
      config?: Config;
      telemetry?: Telemetry;
    },
  ): Promise<Workspace> {
    const workspace = new Workspace(
      {
        name: config.name,
        id: config.id,
        servers: config.servers,
        description: config.description ?? undefined,
      },
      {
        oAuthHandler: params?.oAuthHandler,
        config: params?.config,
        telemetry: params?.telemetry,
      },
    );

    await workspace.addSystemTarget(new PromptManager(config.prompts || []));
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

  private async toConfig(): Promise<ProxyServerAttributes> {
    return {
      id: this.id,
      name: this.name,
      description: this.description ?? undefined,
      prompts: await this.listPrompts(),
      servers: this.targets
        .filter(
          (target) =>
            target instanceof HTTPClient || target instanceof StdioClient,
        )
        .map((target) => {
          if (target instanceof HTTPClient) {
            return {
              name: target.name,
              toolPrefix: target.toolPrefix ?? undefined,
              disabledTools: target.disabledTools ?? undefined,
              disabled: target.disabled,
              transport: { type: "http", url: target.url },
            };
          } else if (target instanceof StdioClient) {
            return {
              name: target.name,
              toolPrefix: target.toolPrefix ?? undefined,
              disabledTools: target.disabledTools ?? undefined,
              disabled: target.disabled,
              transport: {
                type: "stdio",
                command: target.command,
                args: target.args,
                env: target.env,
              },
            };
          } else {
            throw new Error("Unknown target type");
          }
        }),
    };
  }
}
