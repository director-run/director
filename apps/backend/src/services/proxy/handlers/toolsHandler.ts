import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  CompatibilityCallToolResultSchema,
  ListToolsRequestSchema,
  ListToolsResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { ProxyTarget } from "../ProxyTarget";

export function setupToolHandlers(
  server: Server,
  connectedClients: ProxyTarget[],
  // toolToClientMap: Map<string, ProxyClient>,
) {
  const toolToClientMap = new Map<string, ProxyTarget>();

  // List Tools Handler
  server.setRequestHandler(ListToolsRequestSchema, async (request) => {
    const allTools: Tool[] = [];
    toolToClientMap.clear();

    for (const connectedClient of connectedClients) {
      try {
        const result = await connectedClient.client.request(
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
        console.error(
          `Error fetching tools from ${connectedClient.name}:`,
          error,
        );
      }
    }

    return { tools: allTools };
  });

  // Call Tool Handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const clientForTool = toolToClientMap.get(name);

    if (!clientForTool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      // Use the correct schema for tool calls
      return await clientForTool.client.request(
        {
          method: "tools/call",
          params: {
            name,
            arguments: args || {},
            _meta: {
              progressToken: request.params._meta?.progressToken,
            },
          },
        },
        CompatibilityCallToolResultSchema,
      );
    } catch (error) {
      console.error(`Error calling tool through ${clientForTool.name}:`, error);
      throw error;
    }
  });
}
