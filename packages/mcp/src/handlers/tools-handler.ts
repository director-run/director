import { getLogger } from "@director.run/utilities/logger";
import {
  CallToolRequestSchema,
  CompatibilityCallToolResultSchema,
  ErrorCode,
  ListToolsRequestSchema,
  ListToolsResultSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { ProxyServer } from "../proxy-server";
import type { ProxyTarget } from "../proxy-target";

const logger = getLogger("proxy/handlers/toolsHandler");

export function setupToolHandlers(
  server: ProxyServer,
  connectedClients: ProxyTarget[],
) {
  const toolToClientMap = new Map<string, ProxyTarget>();
  const prefixedToOriginalMap = new Map<string, string>();

  // List Tools Handler
  server.setRequestHandler(ListToolsRequestSchema, async (request) => {
    const allTools: Tool[] = [];
    toolToClientMap.clear();
    prefixedToOriginalMap.clear();

    for (const connectedClient of connectedClients) {
      try {
        const result = await connectedClient.request(
          {
            method: "tools/list",
            params: {
              _meta: request.params?._meta,
            },
          },
          ListToolsResultSchema,
        );

        if (result.tools) {
          const toolsWithSource = result.tools.map((tool) => {
            const shouldPrefix = connectedClient.attributes.add_prefix === true;
            const toolName = shouldPrefix
              ? `${connectedClient.name}__${tool.name}`
              : tool.name;

            toolToClientMap.set(toolName, connectedClient);
            if (shouldPrefix) {
              prefixedToOriginalMap.set(toolName, tool.name);
            }

            return {
              ...tool,
              name: toolName,
              description: `[${connectedClient.name}] ${tool.description || ""}`,
            };
          });
          allTools.push(...toolsWithSource);
        }
      } catch (error) {
        logger.warn(
          {
            error,
            clientName: connectedClient.name,
            proxyId: server.id,
          },
          "Could not fetch tools from client. Continuing with other clients.",
        );
        continue;
      }
    }

    return { tools: allTools };
  });

  // Call Tool Handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name } = request.params;
    const clientForTool = toolToClientMap.get(name);

    if (!clientForTool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    // Get the original tool name if this is a prefixed tool
    const originalToolName = prefixedToOriginalMap.get(name) || name;

    try {
      return await clientForTool.request(
        {
          method: "tools/call",
          params: {
            name: originalToolName,
            arguments: request.params.arguments || {},
            _meta: request.params._meta,
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
            clientName: clientForTool.name,
            toolName: name,
            proxyId: server.id,
          },
          "Target does not support tools/call",
        );
        throw error;
      }
      logger.error(
        {
          error,
          clientName: clientForTool.name,
          toolName: name,
          proxyId: server.id,
        },
        "Error calling tool on client",
      );
      throw error;
    }
  });
}
