import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import * as eventsource from "eventsource";
import { getLogger } from "../../helpers/logger";
import type { McpServer } from "../db/schema";
import { ProxyTarget } from "./ProxyTarget";
import { setupPromptHandlers } from "./handlers/promptsHandler";
import { setupResourceTemplateHandlers } from "./handlers/resourceTemplatesHandler";
import { setupResourceHandlers } from "./handlers/resourcesHandler";
import { setupToolHandlers } from "./handlers/toolsHandler";

const logger = getLogger("ProxyServer");

global.EventSource = eventsource.EventSource;

export class ProxyServer {
  private mcpServer: Server;
  private targets: ProxyTarget[];
  private transports: Map<string, SSEServerTransport>;

  constructor() {
    this.mcpServer = new Server(
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
    this.targets = [];
    this.transports = new Map<string, SSEServerTransport>();
  }

  static async create(targets: McpServer[]): Promise<ProxyServer> {
    const proxyServer = new ProxyServer();
    await proxyServer.initialize(targets);
    return proxyServer;
  }

  private async initialize(targets: McpServer[]): Promise<void> {
    this.targets = await this.createTargets(targets);
    this.setupHandlers();
  }

  private async createTargets(servers: McpServer[]): Promise<ProxyTarget[]> {
    const targets: ProxyTarget[] = [];

    for (const server of servers) {
      try {
        const target = new ProxyTarget(server);
        await target.connect();
        targets.push(target);
      } catch (error) {
        logger.error({
          message: `Failed to connect to target ${server.name}`,
          error,
        });
      }
    }

    return targets;
  }

  private setupHandlers(): void {
    setupToolHandlers(this.mcpServer, this.targets);
    setupPromptHandlers(this.mcpServer, this.targets);
    setupResourceHandlers(this.mcpServer, this.targets);
    setupResourceTemplateHandlers(this.mcpServer, this.targets);
  }

  async close(): Promise<void> {
    await Promise.all(this.targets.map((target) => target.close()));
  }

  getServer(): Server {
    return this.mcpServer;
  }

  getTransports(): Map<string, SSEServerTransport> {
    return this.transports;
  }
}
