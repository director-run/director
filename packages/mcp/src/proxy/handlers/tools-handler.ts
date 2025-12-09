import { getLogger } from "@director.run/utilities/logger";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { ProxyServer, ProxyTarget } from "../proxy-server";

const logger = getLogger("proxy/handlers/toolsHandler");

export function setupToolHandlers(server: ProxyServer) {
  let toolToTarget: Map<string, ProxyTarget> = new Map();

  server.setRequestHandler(ListToolsRequestSchema, async (request) => {
    const allTools: Tool[] = [];
    toolToTarget = new Map();

    for (const connectedClient of server.targets) {
      try {
        const { tools } = await connectedClient.listTools(request.params);
        for (const tool of tools) {
          allTools.push(tool);
          toolToTarget.set(tool.name, connectedClient);
        }
      } catch (error) {
        console.error("--------------------------------");
        console.error("--------------------------------");
        console.error("Error listing tools from client", connectedClient.name);
        console.error(error);
        console.error("--------------------------------");
        console.error("--------------------------------");

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

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    // TODO: populate the toolToTarget map here if it's not already populated
    const { name } = request.params;
    const client = toolToTarget.get(name);
    if (!client) {
      throw new Error(`Unknown tool: ${name}`);
    }

    return await client.callTool(request.params);
  });
}
