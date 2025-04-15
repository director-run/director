import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import * as eventsource from "eventsource";
import { getLogger } from "../../helpers/logger";
import { sleep } from "../../helpers/util";
import type { McpServer } from "../db/schema";
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

  const toolToClientMap = new Map<string, ProxyClient>();
  const resourceToClientMap = new Map<string, ProxyClient>();
  const promptToClientMap = new Map<string, ProxyClient>();

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

export class ProxyClient {
  public client: Client;
  private transport: Transport;
  private target: McpServer;

  get name() {
    return this.target.name;
  }

  constructor(target: McpServer) {
    this.target = target;

    if (this.target.transport.type === "sse") {
      this.transport = new SSEClientTransport(
        new URL(this.target.transport.url),
      );
    } else {
      this.transport = new StdioClientTransport({
        command: this.target.transport.command,
        args: this.target.transport.args,
        env: this.target.transport.env
          ? this.target.transport.env.reduce(
              (o, v) => ({
                [v]: process.env[v] || "",
              }),
              {},
            )
          : undefined,
      });
    }

    if (!this.transport) {
      throw new Error(`Transport ${this.target.name} not available.`);
    }

    this.client = new Client(
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
  }

  async connect() {
    await this.client.connect(this.transport);
  }

  async close() {
    await this.client.close();
  }
}

const createClients = async (servers: McpServer[]): Promise<ProxyClient[]> => {
  const clients: ProxyClient[] = [];

  for (const server of servers) {
    // logger.info(`Connecting to server: ${server.name}`);

    const waitFor = 2500;
    const retries = 3;
    let count = 0;
    let retry = true;

    while (retry) {
      const client = new ProxyClient(server);

      try {
        await client.connect();
        clients.push(client);
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
