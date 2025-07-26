import { getLogger } from "@director.run/utilities/logger";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  CompatibilityCallToolResultSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
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
   * Call a tool on this client with automatic prefix handling
   */
  public async callToolWithPrefixing(
    toolName: string,
    arguments_: Record<string, unknown> = {},
    requestMeta?: Record<string, unknown>,
  ): Promise<{
    [x: string]: unknown;
    _meta?: { [x: string]: unknown } | undefined;
  }> {
    let originalToolName = toolName;
    if (this._toolPrefix && toolName.startsWith(`${this._toolPrefix}__`)) {
      originalToolName = toolName.substring(`${this._toolPrefix}__`.length);
    }

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
