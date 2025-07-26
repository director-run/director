import { getLogger } from "@director.run/utilities/logger";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { AbstractClient } from "../client/abstract-client";
import type { ProxyServer } from "../proxy-server";

const logger = getLogger("proxy/handlers/toolsHandler");

export function setupToolHandlers(
  server: ProxyServer,
  connectedClients: AbstractClient[],
  addToolPrefix?: boolean,
) {
  const toolToClientMap = new Map<string, AbstractClient>();
  const prefixedToOriginalMap = new Map<string, string>();

  // List Tools Handler
  server.setRequestHandler(ListToolsRequestSchema, async (request) => {
    const allTools: Tool[] = [];
    toolToClientMap.clear();
    prefixedToOriginalMap.clear();

    for (const connectedClient of connectedClients) {
      const result = await connectedClient.listToolsWithPrefix(
        addToolPrefix,
        request.params?._meta,
      );

      allTools.push(...result.tools);

      // Merge the maps
      for (const [key, value] of result.toolToClientMap) {
        toolToClientMap.set(key, value);
      }
      for (const [key, value] of result.prefixedToOriginalMap) {
        prefixedToOriginalMap.set(key, value);
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

    return await clientForTool.callToolWithName(
      name,
      originalToolName,
      request.params.arguments || {},
      request.params._meta,
    );
  });
}
