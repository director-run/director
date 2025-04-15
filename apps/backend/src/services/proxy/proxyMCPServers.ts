import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import * as eventsource from "eventsource";
import { getLogger } from "../../helpers/logger";
import type { McpServer } from "../db/schema";
import { ProxyClient } from "./ProxyClient";
import { setupPromptHandlers } from "./handlers/promptsHandler";
import { setupResourceTemplateHandlers } from "./handlers/resourceTemplatesHandler";
import { setupResourceHandlers } from "./handlers/resourcesHandler";
import { setupToolHandlers } from "./handlers/toolsHandler";

const logger = getLogger("proxyMCPServers");

global.EventSource = eventsource.EventSource;

// Store for active proxy server connections
export interface ProxyServerInstance {
  server: Server;
  close: () => Promise<void>;
  transports: Map<string, SSEServerTransport>; // Connection ID -> Transport
}

export const proxyMCPServers = async (
  targets: McpServer[],
): Promise<ProxyServerInstance> => {
  const connectedClients = await createClients(targets);

  const server = new Server(
    {
      name: "mcp-proxy-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        prompts: {},
        resources: { subscribe: true },
        tools: {},
      },
    },
  );

  setupToolHandlers(server, connectedClients);
  setupPromptHandlers(server, connectedClients);
  setupResourceHandlers(server, connectedClients);
  setupResourceTemplateHandlers(server, connectedClients);

  return {
    server,
    close: async () => {
      await Promise.all(
        connectedClients.map(({ close: cleanup }) => cleanup()),
      );
    },
    transports: new Map<string, SSEServerTransport>(),
  };
};

const createClients = async (servers: McpServer[]): Promise<ProxyClient[]> => {
  const clients: ProxyClient[] = [];

  for (const server of servers) {
    try {
      const proxyClient = new ProxyClient(server);
      await proxyClient.connect();
      clients.push(proxyClient);
    } catch (error) {
      logger.error({
        message: `Failed to connect to server ${server.name}`,
        error,
      });
    }
  }

  return clients;
};
