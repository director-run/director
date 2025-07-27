import { getLogger } from "@director.run/utilities/logger";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { AbstractClient } from "../../client/abstract-client";
import type { ProxyServer } from "../proxy-server";
import { callTool } from "../tools/call-tool";
import { listTools } from "../tools/list-tools";

const logger = getLogger("proxy/handlers/toolsHandler");

export function setupToolHandlers(
  server: ProxyServer,
  connectedClients: AbstractClient[],
) {
  // Map of toolName -> client instance
  let toolToClientMap: Map<string, AbstractClient> = new Map();

  // List Tools Handler
  server.setRequestHandler(ListToolsRequestSchema, async (request) => {
    const allTools: Tool[] = [];
    toolToClientMap = new Map(); // Reset map each time

    for (const connectedClient of connectedClients) {
      try {
        const tools = await listTools({
          requestMeta: request.params?._meta,
          client: connectedClient,
          toolPrefix: server.addToolPrefix ? connectedClient.name : undefined,
        });
        for (const tool of tools) {
          allTools.push(tool);
          toolToClientMap.set(tool.name, connectedClient);
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
    const client = toolToClientMap.get(name);
    if (!client) {
      throw new Error(`Unknown tool: ${name}`);
    }
    return await callTool({
      client,
      toolName: name,
      arguments_: request.params.arguments || {},
      requestMeta: request.params._meta,
      toolPrefix: server.addToolPrefix ? client.name : undefined,
    });
  });
}
