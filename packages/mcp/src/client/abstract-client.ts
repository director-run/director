import type { ProxyTargetSource } from "@director.run/utilities/schema";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { RequestOptions } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
  CallToolRequest,
  CallToolResultSchema,
  CompatibilityCallToolResultSchema,
  ListToolsRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
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
  disabledTools?: string[];
  disabled?: boolean; // if true, the client will not connect
};

// TODO: use generic type for source so it makes a better sdk
export abstract class AbstractClient extends Client {
  public readonly name: string;
  public status: ClientStatus = "disconnected";
  public lastConnectedAt?: Date;
  public lastErrorMessage?: string;
  public readonly source?: ProxyTargetSource;
  public toolPrefix?: string;
  public disabledTools?: string[];
  protected _disabled: boolean = false;

  constructor(params: AbstractClientParams) {
    const { name, source, toolPrefix, disabledTools, disabled } = params;
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
    this.disabledTools = disabledTools;
    this._disabled = disabled ?? false;
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
      tools: result.tools
        .filter((tool) => !this.disabledTools?.includes(tool.name))
        .map((tool) => {
          return {
            ...tool,
            name: this.toolPrefix
              ? `${this.toolPrefix}${tool.name}`
              : tool.name,
          };
        }),
    };
  }

  public get disabled() {
    return this._disabled;
  }

  public async setDisabled(disabled: boolean) {
    this._disabled = disabled;
    if (disabled) {
      await this.close();
    } else {
      await this.connectToTarget({ throwOnError: true });
    }
  }

  public isConnected(): boolean {
    return this.status === "connected";
  }

  public async originalListTools(
    params?: ListToolsRequest["params"],
    options?: RequestOptions,
  ) {
    return await super.listTools(params, options);
  }

  public async callTool(
    params: CallToolRequest["params"],
    resultSchema?:
      | typeof CallToolResultSchema
      | typeof CompatibilityCallToolResultSchema,
    options?: RequestOptions,
  ) {
    if (this.toolPrefix && !params.name.startsWith(this.toolPrefix)) {
      // Throw an error if trying to use the original tool name when using a tool prefix
      throw new McpError(
        ErrorCode.InternalError,
        `Unknown tool: "${params.name}"`,
      );
    }

    const toolName =
      this.toolPrefix && params.name.startsWith(this.toolPrefix)
        ? params.name.substring(this.toolPrefix.length)
        : params.name;

    if (this.disabledTools?.includes(toolName)) {
      throw new McpError(
        ErrorCode.InternalError,
        `Tool "${params.name}" is disabled`,
      );
    }

    return await super.callTool(
      {
        ...params,
        name: toolName,
      },
      resultSchema,
      options,
    );
  }

  public async originalCallTool(
    params: CallToolRequest["params"],
    resultSchema?:
      | typeof CallToolResultSchema
      | typeof CompatibilityCallToolResultSchema,
    options?: RequestOptions,
  ) {
    return await super.callTool(params, resultSchema, options);
  }

  public async close(): Promise<void> {
    await super.close();
    // if status is unauthorized, don't change it
    this.status = ["unauthorized", "error"].includes(this.status)
      ? this.status
      : "disconnected";
  }
}
