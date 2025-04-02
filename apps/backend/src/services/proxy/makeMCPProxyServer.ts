import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import * as eventsource from "eventsource";
import { getLogger } from "../../helpers/logger";
import type { ServerConfigItem } from "../store/types";
import { setupPromptHandlers } from "./handlers/promptsHandler";
import { setupResourceTemplateHandlers } from "./handlers/resourceTemplatesHandler";
import { setupResourceHandlers } from "./handlers/resourcesHandler";
import { setupToolHandlers } from "./handlers/toolsHandler";

const logger = getLogger("makeMCPProxyServer");

global.EventSource = eventsource.EventSource;

export const makeMCPProxyServer = async (
  servers: ServerConfigItem[],
): Promise<{ server: Server; cleanup: () => Promise<void> }> => {
  const connectedClients = await createClients(servers);

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

const sleep = (time: number) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), time));

export interface ConnectedClient {
  client: Client;
  cleanup: () => Promise<void>;
  name: string;
}

const createClient = (
  server: ServerConfigItem,
): { client: Client | undefined; transport: Transport | undefined } => {
  let transport: Transport | null = null;
  try {
    if (server.transport.type === "sse") {
      transport = new SSEClientTransport(new URL(server.transport.url));
    } else {
      transport = new StdioClientTransport({
        command: server.transport.command,
        args: server.transport.args,
        env: server.transport.env
          ? server.transport.env.reduce(
              (o, v) => ({
                [v]: process.env[v] || "",
              }),
              {},
            )
          : undefined,
      });
    }
  } catch (error) {
    console.error(
      `Failed to create transport ${server.transport.type || "stdio"} to ${server.name}:`,
      error,
    );
  }

  if (!transport) {
    console.warn(`Transport ${server.name} not available.`);
    return { transport: undefined, client: undefined };
  }

  const client = new Client(
    {
      name: "mcp-proxy-client",
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

  return { client, transport };
};

const createClients = async (
  servers: ServerConfigItem[],
): Promise<ConnectedClient[]> => {
  const clients: ConnectedClient[] = [];

  for (const server of servers) {
    // logger.info(`Connecting to server: ${server.name}`);

    const waitFor = 2500;
    const retries = 3;
    let count = 0;
    let retry = true;

    while (retry) {
      const { client, transport } = createClient(server);
      if (!client || !transport) {
        break;
      }

      try {
        await client.connect(transport);
        // logger.info(`Connected to server: ${server.name}`);

        clients.push({
          client,
          name: server.name,
          cleanup: async () => {
            await transport.close();
          },
        });

        break;
      } catch (error) {
        logger.error({
          message: `error while connecting to server ${server.name}`,
          server,
          error: error,
        });

        count++;
        retry = count < retries;
        if (retry) {
          try {
            await client.close();
          } catch {}
          // logger.info(`Retry connection to ${server.name} in ${waitFor}ms (${count}/${retries})`);
          await sleep(waitFor);
        }
      }
    }
  }

  return clients;
};
