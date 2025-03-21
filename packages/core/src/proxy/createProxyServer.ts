import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import * as eventsource from "eventsource";
import type { ProxyConfig } from "../config/types";
import { createClients } from "./createClients";
import type { ConnectedClient } from "./createClients";
import { setupPromptHandlers } from "./handlers/promptsHandler";
import { setupResourceTemplateHandlers } from "./handlers/resourceTemplatesHandler";
import { setupResourceHandlers } from "./handlers/resourcesHandler";
import { setupToolHandlers } from "./handlers/toolsHandler";

global.EventSource = eventsource.EventSource;

export const createProxyServer = async (config: ProxyConfig) => {
  const connectedClients = await createClients(config.servers);
  // logger.info(`Connected to ${connectedClients.length} servers`);

  // Maps to track which client owns which resource
  const toolToClientMap = new Map<string, ConnectedClient>();
  const resourceToClientMap = new Map<string, ConnectedClient>();
  const promptToClientMap = new Map<string, ConnectedClient>();

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

  setupToolHandlers(server, connectedClients, toolToClientMap);
  setupPromptHandlers(server, connectedClients, promptToClientMap);
  setupResourceHandlers(server, connectedClients, resourceToClientMap);
  setupResourceTemplateHandlers(server, connectedClients);

  const cleanup = async () => {
    await Promise.all(connectedClients.map(({ cleanup }) => cleanup()));
  };

  return { server, cleanup };
};
