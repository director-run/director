import { AbstractClient } from "@director.run/mcp/client/abstract-client";
import { getLogger } from "@director.run/utilities/logger";
import { ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const logger = getLogger("proxy/tools/list-tools");

export async function listTools(params: {
  client: AbstractClient;
  requestMeta?: Record<string, unknown>;
  toolPrefix?: string;
}): Promise<Tool[]> {
  const { client, requestMeta, toolPrefix } = params;
  try {
    const result = await client.request(
      {
        method: "tools/list",
        params: {
          _meta: requestMeta,
        },
      },
      ListToolsResultSchema,
    );

    if (!result.tools) {
      return [];
    }

    return result.tools.map((tool) => {
      const toolName = toolPrefix ? `${toolPrefix}__${tool.name}` : tool.name;

      return {
        ...tool,
        name: toolName,
        description: `[${client.name}] ${tool.description || ""}`,
      };
    });
  } catch (error) {
    logger.warn(
      {
        error,
        clientName: client.name,
      },
      "Could not fetch tools from client.",
    );
    return [];
  }
}
