import { requiredStringSchema } from "@director.run/utilities/schema";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { RequestOptions } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type {
  CallToolRequest,
  CallToolResultSchema,
  CompatibilityCallToolResultSchema,
  GetPromptRequest,
  ListPromptsRequest,
  ListToolsRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import packageJson from "../../package.json";

export type ClientStatus =
  | "connected"
  | "disconnected"
  | "unauthorized"
  | "error";

export const SourceDataSchema = z.object({
  name: requiredStringSchema,
  entryId: requiredStringSchema,
  entryData: z.record(z.string(), z.unknown()).optional(),
});

// TODO: deprecate this as soon as clients no longer use it
export type SourceData = z.infer<typeof SourceDataSchema>;

export const ToolsConfigSchema = z.object({
  include: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
  prefix: z.string().optional(),
});

export const PromptsConfigSchema = z.object({
  include: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
});

export const AbsractClientSchema = z.object({
  name: requiredStringSchema,
  source: SourceDataSchema.optional(),
  tools: ToolsConfigSchema.optional(),
  prompts: PromptsConfigSchema.optional(),
  disabled: z.boolean().optional(),
});

export type AbstractClientParams = z.infer<typeof AbsractClientSchema>;

export type ToolsConfig = z.infer<typeof ToolsConfigSchema>;

export type PromptsConfig = z.infer<typeof PromptsConfigSchema>;

export abstract class AbstractClient<
  Params extends AbstractClientParams,
> extends Client {
  public readonly name: string;
  public status: ClientStatus = "disconnected";
  public lastConnectedAt?: Date;
  public lastErrorMessage?: string;
  public readonly source?: SourceData;
  public tools?: ToolsConfig;
  public prompts?: PromptsConfig;
  protected _disabled: boolean = false;

  constructor(params: Params) {
    const { name, source, tools, prompts: promptsConfig, disabled } = params;
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
    this.tools = tools;
    this.prompts = promptsConfig;
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
        .filter((tool) => {
          // Apply include filter if specified
          if (this.tools?.include && this.tools.include.length > 0) {
            if (!this.tools.include.includes(tool.name)) {
              return false;
            }
          }
          // Apply exclude filter
          if (this.tools?.exclude && this.tools.exclude.includes(tool.name)) {
            return false;
          }
          return true;
        })
        .map((tool) => {
          return {
            ...tool,
            name: this.tools?.prefix
              ? `${this.tools.prefix}${tool.name}`
              : tool.name,
          };
        }),
    };
  }

  public async listPrompts(
    params?: ListPromptsRequest["params"],
    options?: RequestOptions,
  ) {
    const result = await super.listPrompts(params, options);
    return {
      ...result,
      prompts: result.prompts.filter((prompt) => {
        // Apply include filter if specified
        if (this.prompts?.include && this.prompts.include.length > 0) {
          if (!this.prompts.include.includes(prompt.name)) {
            return false;
          }
        }
        // Apply exclude filter
        if (
          this.prompts?.exclude &&
          this.prompts.exclude.includes(prompt.name)
        ) {
          return false;
        }
        return true;
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
    try {
      return await super.listTools(params, options);
    } catch (error) {
      if (
        error instanceof McpError &&
        error.code === ErrorCode.MethodNotFound
      ) {
        // No tools available
        return { tools: [] };
      } else {
        throw error;
      }
    }
  }

  public async callTool(
    params: CallToolRequest["params"],
    resultSchema?:
      | typeof CallToolResultSchema
      | typeof CompatibilityCallToolResultSchema,
    options?: RequestOptions,
  ) {
    const prefix = this.tools?.prefix;
    if (prefix && !params.name.startsWith(prefix)) {
      // Throw an error if trying to use the original tool name when using a tool prefix
      throw new McpError(
        ErrorCode.InternalError,
        `Unknown tool: "${params.name}"`,
      );
    }

    const toolName =
      prefix && params.name.startsWith(prefix)
        ? params.name.substring(prefix.length)
        : params.name;

    // Check if tool is explicitly excluded
    if (this.tools?.exclude && this.tools.exclude.includes(toolName)) {
      throw new McpError(
        ErrorCode.InternalError,
        `Tool "${params.name}" is disabled`,
      );
    }

    // Check if tool is in include list (if include list is specified)
    if (this.tools?.include && this.tools.include.length > 0) {
      if (!this.tools.include.includes(toolName)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool "${params.name}" is disabled`,
        );
      }
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

  public async getPrompt(
    params: GetPromptRequest["params"],
    options?: RequestOptions,
  ) {
    const promptName = params.name;

    // Check if prompt is explicitly excluded
    if (this.prompts?.exclude && this.prompts.exclude.includes(promptName)) {
      throw new McpError(
        ErrorCode.InternalError,
        `Prompt "${promptName}" is disabled`,
      );
    }

    // Check if prompt is in include list (if include list is specified)
    if (this.prompts?.include && this.prompts.include.length > 0) {
      if (!this.prompts.include.includes(promptName)) {
        throw new McpError(
          ErrorCode.InternalError,
          `Prompt "${promptName}" is disabled`,
        );
      }
    }

    return await super.getPrompt(params, options);
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

  public async originalListPrompts(
    params?: ListPromptsRequest["params"],
    options?: RequestOptions,
  ) {
    try {
      return await super.listPrompts(params, options);
    } catch (error) {
      if (
        error instanceof McpError &&
        error.code === ErrorCode.MethodNotFound
      ) {
        // No prompts available
        return { prompts: [] };
      } else {
        throw error;
      }
    }
  }

  public async originalGetPrompt(
    params: GetPromptRequest["params"],
    options?: RequestOptions,
  ) {
    return await super.getPrompt(params, options);
  }

  public async close(): Promise<void> {
    await super.close();
    // if status is unauthorized, don't change it
    this.status = ["unauthorized", "error"].includes(this.status)
      ? this.status
      : "disconnected";
  }

  public abstract toPlainObject(include?: {
    tools?: boolean;
    connectionInfo?: boolean;
  }): Promise<
    Params & {
      type: string;
      toolsList?: Tool[];
      connectionInfo?: {
        status: ClientStatus;
        lastConnectedAt?: Date;
        lastErrorMessage?: string;
      };
    }
  >;
}
