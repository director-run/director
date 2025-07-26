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
) {
  // List Tools Handler
  server.setRequestHandler(ListToolsRequestSchema, async (request) => {
    const allTools: Tool[] = [];

    for (const connectedClient of connectedClients) {
      try {
        const tools = await connectedClient.listToolsWithPrefixing(
          request.params?._meta,
        );
        allTools.push(...tools);
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

    // Find the client that has this tool
    for (const connectedClient of connectedClients) {
      try {
        // Try to call the tool on this client - it will handle prefixing internally
        return await connectedClient.callToolWithPrefixing(
          name,
          request.params.arguments || {},
          request.params._meta,
        );
      } catch (error) {
        // If this client doesn't have the tool, continue to the next one
        if (error instanceof Error && error.message.includes("Unknown tool")) {
          continue;
        }
        // If it's a different error, re-throw it
        throw error;
      }
    }

    // If we get here, no client had the tool
    throw new Error(`Unknown tool: ${name}`);
  });
}
