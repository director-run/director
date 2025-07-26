import { getLogger } from "@director.run/utilities/logger";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  CompatibilityCallToolResultSchema,
  ErrorCode,
  ListToolsResultSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import packageJson from "../../package.json";

const logger = getLogger("client/abstract");

export type ClientStatus =
  | "connected"
  | "disconnected"
  | "unauthorized"
  | "error";

export type SerializedClient = {
  name: string;
  status: ClientStatus;
  lastConnectedAt?: Date;
  lastErrorMessage?: string;
  command: string;
  type: "http" | "stdio" | "in-memory";
};

export abstract class AbstractClient extends Client {
  public readonly name: string;
  public status: ClientStatus = "disconnected";
  public lastConnectedAt?: Date;
  public lastErrorMessage?: string;
  private readonly _toolPrefix?: string;

  constructor(name: string, toolPrefix?: string) {
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
    this._toolPrefix = toolPrefix;
  }

  public abstract toPlainObject(): SerializedClient;

  public abstract connectToTarget({
    throwOnError,
  }: {
    throwOnError: boolean;
  }): Promise<boolean>;

  /**
   * List tools from this client with prefixing based on internal toolPrefix
   */
  public async listToolsWithPrefix(
    requestMeta?: Record<string, unknown>,
  ): Promise<{
    tools: Tool[];
    toolToClientMap: Map<string, AbstractClient>;
    prefixedToOriginalMap: Map<string, string>;
  }> {
    const tools: Tool[] = [];
    const toolToClientMap = new Map<string, AbstractClient>();
    const prefixedToOriginalMap = new Map<string, string>();

    try {
      const result = await this.request(
        {
          method: "tools/list",
          params: {
            _meta: requestMeta,
          },
        },
        ListToolsResultSchema,
      );

      if (result.tools) {
        const toolsWithSource = result.tools.map((tool) => {
          const toolName = this._toolPrefix
            ? `${this._toolPrefix}__${tool.name}`
            : tool.name;

          toolToClientMap.set(toolName, this);
          if (this._toolPrefix) {
            prefixedToOriginalMap.set(toolName, tool.name);
          }

          return {
            ...tool,
            name: toolName,
            description: `[${this.name}] ${tool.description || ""}`,
          };
        });
        tools.push(...toolsWithSource);
      }
    } catch (error) {
      logger.warn(
        {
          error,
          clientName: this.name,
        },
        "Could not fetch tools from client.",
      );
    }

    return { tools, toolToClientMap, prefixedToOriginalMap };
  }

  /**
   * Call a tool on this client
   */
  public async callToolWithName(
    toolName: string,
    originalToolName: string,
    arguments_: Record<string, unknown> = {},
    requestMeta?: Record<string, unknown>,
  ): Promise<{
    [x: string]: unknown;
    _meta?: { [x: string]: unknown } | undefined;
  }> {
    try {
      return await this.request(
        {
          method: "tools/call",
          params: {
            name: originalToolName,
            arguments: arguments_,
            _meta: requestMeta,
          },
        },
        CompatibilityCallToolResultSchema,
      );
    } catch (error) {
      if (
        error instanceof McpError &&
        error.code === ErrorCode.MethodNotFound
      ) {
        logger.warn(
          {
            clientName: this.name,
            toolName,
          },
          "Target does not support tools/call",
        );
        throw error;
      }
      logger.error(
        {
          error,
          clientName: this.name,
          toolName,
        },
        "Error calling tool on client",
      );
      throw error;
    }
  }
}
