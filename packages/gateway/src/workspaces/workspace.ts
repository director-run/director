import { HTTPClient } from "@director.run/mcp/client/http-client";
import { StdioClient } from "@director.run/mcp/client/stdio-client";
import type { OAuthHandler } from "@director.run/mcp/oauth/oauth-provider-factory";
import { ProxyServer } from "@director.run/mcp/proxy/proxy-server";
import type { ProxyServerAttributes } from "@director.run/utilities/schema";
import { PromptManager } from "../capabilities/prompt-manager";

export class Workspace extends ProxyServer {
  constructor(
    attributes: ProxyServerAttributes,
    params?: {
      oAuthHandler?: OAuthHandler;
    },
  ) {
    super(attributes, params);
  }

  static async fromConfig(
    config: ProxyServerAttributes,
    params?: {
      oAuthHandler?: OAuthHandler;
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
      },
    );

    await workspace.addTarget(new PromptManager(config.prompts || []));
    await workspace.connectTargets();

    return workspace;
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
