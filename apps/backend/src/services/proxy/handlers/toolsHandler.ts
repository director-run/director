import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  CompatibilityCallToolResultSchema,
  ListToolsRequestSchema,
  ListToolsResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { getLogger } from "../../../helpers/logger";
import type { ConnectedClient } from "../ConnectedClient";

const logger = getLogger("proxy/handlers/toolsHandler");

export function setupToolHandlers(
  server: Server,
  connectedClients: ConnectedClient[],
) {
  const toolToClientMap = new Map<string, ConnectedClient>();

  // List Tools Handler
  server.setRequestHandler(ListToolsRequestSchema, async (request) => {
    const allTools: Tool[] = [];
    toolToClientMap.clear();

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
            toolToClientMap.set(tool.name, connectedClient);
            return {
              ...tool,
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

    try {
      return await clientForTool.request(
        {
          method: "tools/call",
          params: {
            name,
            arguments: request.params.arguments || {},
            _meta: request.params._meta,
          },
        },
        CompatibilityCallToolResultSchema,
      );
    } catch (error) {
      logger.error(
        {
          error,
          clientName: clientForTool.name,
          toolName: name,
        },
        "Error calling tool on client",
      );
      throw error;
    }
  });
}
