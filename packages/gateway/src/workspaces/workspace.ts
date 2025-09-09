import { HTTPClient } from "@director.run/mcp/client/http-client";
import { StdioClient } from "@director.run/mcp/client/stdio-client";
import type { OAuthHandler } from "@director.run/mcp/oauth/oauth-provider-factory";
import { ProxyServer } from "@director.run/mcp/proxy/proxy-server";
import { type ProxyTarget } from "@director.run/mcp/proxy/proxy-server";
import type { ProxyServerAttributes } from "@director.run/utilities/schema";
import type { ProxyTargetAttributes } from "@director.run/utilities/schema";
import { Telemetry } from "@director.run/utilities/telemetry";
import { PromptManager } from "../capabilities/prompt-manager";
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

  public async addServer(
    server: ProxyTargetAttributes,
    params: { throwOnError: boolean } = { throwOnError: true },
  ): Promise<ProxyTarget> {
    await this.trackEvent("server_added");
    const target = await super.addTarget(server, params);

    await this.persistToConfig();
    return target;
  }

  public async removeServer(serverName: string): Promise<ProxyTarget> {
    await this.trackEvent("server_removed");
    const removedTarget = await super.removeTarget(serverName);

    await this.persistToConfig();
    return removedTarget;
  }

  public async update(
    attributes: Partial<Pick<ProxyServerAttributes, "name" | "description">>,
  ) {
    await this.trackEvent("proxy_updated");
    await super.update(attributes);
    await this.persistToConfig();

    return this;
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

    await workspace.addTarget(new PromptManager(config.prompts || []));
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
      await this._config.setWorkspace(this.id, this.toConfig());
    }
  }

  toConfig(): ProxyServerAttributes {
    return {
      id: this.id,
      name: this.name,
      description: this.description ?? undefined,
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
