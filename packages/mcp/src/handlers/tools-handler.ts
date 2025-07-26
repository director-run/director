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

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name } = request.params;
    for (const connectedClient of connectedClients) {
      try {
        return await connectedClient.callToolWithPrefixing(
          name,
          request.params.arguments || {},
          request.params._meta,
        );
      } catch (error) {
        if (error instanceof Error && error.message.includes("Unknown tool")) {
          continue;
        }
        throw error;
      }
    }
    throw new Error(`Unknown tool: ${name}`);
  });
}
