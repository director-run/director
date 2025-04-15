import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import * as eventsource from "eventsource";
import express from "express";
import type { Logger } from "pino";
import { ErrorCode } from "../../helpers/error";
import { AppError } from "../../helpers/error";
import { getLogger } from "../../helpers/logger";
import { parseMCPMessageBody } from "../../helpers/mcp";
import type { McpServer } from "../db/schema";
import { ProxyTarget } from "./ProxyTarget";
import { setupPromptHandlers } from "./handlers/promptsHandler";
import { setupResourceTemplateHandlers } from "./handlers/resourceTemplatesHandler";
import { setupResourceHandlers } from "./handlers/resourcesHandler";
import { setupToolHandlers } from "./handlers/toolsHandler";

global.EventSource = eventsource.EventSource;

export class ProxyServer {
  private mcpServer: Server;
  private targets: ProxyTarget[];
  private transports: Map<string, SSEServerTransport>;
  private proxyId: string;
  private logger: Logger;

  constructor({ id }: { id: string }) {
    this.proxyId = id;
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
    this.logger = getLogger(`ProxyServer[${this.proxyId}]`);
  }

  static async create({
    id,
    targets,
  }: { id: string; targets: McpServer[] }): Promise<ProxyServer> {
    const proxyServer = new ProxyServer({ id });
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
        this.logger.error({
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

  getServer(): Server {
    return this.mcpServer;
  }

  getTransports(): Map<string, SSEServerTransport> {
    return this.transports;
  }

  async startSSEConnection(req: express.Request, res: express.Response) {
    const transport = new SSEServerTransport(`/${this.proxyId}/message`, res);

    this.getTransports().set(transport.sessionId, transport);

    this.logger.info({
      message: "SSE connection started",
      sessionId: transport.sessionId,
      proxyId: this.proxyId,
      userAgent: req.headers["user-agent"],
      host: req.headers["host"],
    });

    /**
     * The MCP documentation says to use res.on("close", () => { ... }) to
     * clean up the transport when the connection is closed. However, this
     * doesn't work for some reason. So we use this instead.
     *
     * [TODO] Figure out if this is correct. Also add a test case for this.
     */
    req.socket.on("close", () => {
      this.logger.info({
        message: "SSE connection closed",
        sessionId: transport.sessionId,
        proxyId: this.proxyId,
      });
      this.getTransports().delete(transport.sessionId);
    });

    await this.getServer().connect(transport);
  }

  async handleSSEMessage(req: express.Request, res: express.Response) {
    const sessionId = req.query.sessionId?.toString();

    if (!sessionId) {
      // TODO: Add a test case for this.
      throw new AppError(ErrorCode.BAD_REQUEST, "No sessionId provided");
    }
    const body = await parseMCPMessageBody(req);

    this.logger.info({
      message: "Message received",
      proxyId: this.proxyId,
      sessionId,
      method: body.method,
    });

    const transport = this.getTransports().get(sessionId);

    if (!transport) {
      // TODO: Add a test case for this.
      this.logger.warn({
        message: "Transport not found",
        sessionId,
        proxyId: this.proxyId,
      });
      throw new AppError(ErrorCode.NOT_FOUND, "Transport not found");
    }

    await transport.handlePostMessage(req, res, body);
  }

  async close(): Promise<void> {
    this.logger.info(`Shutting down`);

    await Promise.all(this.targets.map((target) => target.close()));
    await this.getServer().close();
  }
}
