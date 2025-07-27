import type { ProxyTargetSource } from "@director.run/utilities/schema";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { RequestOptions } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
  CallToolRequest,
  CallToolResultSchema,
  CompatibilityCallToolResultSchema,
  ListToolsRequest,
} from "@modelcontextprotocol/sdk/types.js";
import packageJson from "../../package.json";

export type ClientStatus =
  | "connected"
  | "disconnected"
  | "unauthorized"
  | "error";

export type AbstractClientParams = {
  name: string;
  source?: ProxyTargetSource;
  toolPrefix?: string;
};

// TODO: use generic type for source so it makes a better sdk
export abstract class AbstractClient extends Client {
  public readonly name: string;
  public status: ClientStatus = "disconnected";
  public lastConnectedAt?: Date;
  public lastErrorMessage?: string;
  public readonly source?: ProxyTargetSource;
  public readonly toolPrefix?: string;

  constructor(params: AbstractClientParams) {
    const { name, source, toolPrefix } = params;
    super(
      {
        name,
        version: packageJson.version,
      },
      {
        capabilities: {
          prompts: {},
          resources: { subscribe: true },
          tools: {},
        },
      },
    );
    this.name = name;
    this.source = source;
    this.toolPrefix = toolPrefix;
  }

  public abstract connectToTarget({
    throwOnError,
  }: {
    throwOnError: boolean;
  }): Promise<boolean>;

  public async listTools(
    params?: ListToolsRequest["params"],
    options?: RequestOptions,
  ) {
    const result = await super.listTools(params, options);
    return {
      ...result,
      tools: result.tools.map((tool) => {
        return {
          ...tool,
          name: this.toolPrefix
            ? `${this.toolPrefix}__${tool.name}`
            : tool.name,
          description: `[${this.name}] ${tool.description || ""}`,
        };
      }),
    };
  }

  public async callTool(
    params: CallToolRequest["params"],
    resultSchema?:
      | typeof CallToolResultSchema
      | typeof CompatibilityCallToolResultSchema,
    options?: RequestOptions,
  ) {
    const toolName =
      this.toolPrefix && params.name.startsWith(`${this.toolPrefix}__`)
        ? params.name.substring(`${this.toolPrefix}__`.length)
        : params.name;

    return await super.callTool(
      {
        ...params,
        name: toolName,
      },
      resultSchema,
      options,
    );
  }
}
