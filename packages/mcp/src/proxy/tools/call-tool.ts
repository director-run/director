import { AbstractClient } from "@director.run/mcp/client/abstract-client";
import { getLogger } from "@director.run/utilities/logger";
import {
  CompatibilityCallToolResultSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

const logger = getLogger("proxy/tools/call-tool");

/**
 * Call a tool on this client with automatic prefix handling
 */
export async function callTool(params: {
  client: AbstractClient;
  toolName: string;
  arguments_: Record<string, unknown>;
  requestMeta?: Record<string, unknown>;
  toolPrefix?: string;
}): Promise<{
  [x: string]: unknown;
  _meta?: { [x: string]: unknown } | undefined;
}> {
  const { client, toolName, arguments_, requestMeta, toolPrefix } = params;
  let originalToolName = toolName;
  if (toolPrefix && toolName.startsWith(`${toolPrefix}__`)) {
    originalToolName = toolName.substring(`${toolPrefix}__`.length);
  }

  try {
    return await client.request(
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
    if (error instanceof McpError && error.code === ErrorCode.MethodNotFound) {
      logger.warn(
        {
          clientName: client.name,
          toolName,
        },
        "Target does not support tools/call",
      );
      throw error;
    }
    logger.error(
      {
        error,
        clientName: client.name,
        toolName,
      },
      "Error calling tool on client",
    );
    throw error;
  }
}
