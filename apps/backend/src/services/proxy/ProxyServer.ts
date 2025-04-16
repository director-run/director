import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import * as eventsource from "eventsource";
import express from "express";
import { PORT, VERSION } from "../../config";
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

const logger = getLogger(`ProxyServer`);

export class ProxyServer {
  private mcpServer: Server;
  private targets: ProxyTarget[];
  private transports: Map<string, SSEServerTransport>;
  private proxyId: string;
  private name: string;
  private description?: string;
  private throwOnError: boolean;
  private targetConfig: McpServer[];

  get id() {
    return this.proxyId;
  }

  get sseUrl() {
    return `http://localhost:${PORT}/${this.proxyId}/sse`;
  }

  public getTargets() {
    return this.targets;
  }

  private constructor({
    id,
    name,
    description,
    throwOnError,
    targetConfig,
  }: {
    id: string;
    name: string;
    description?: string;
    throwOnError?: boolean;
    targetConfig: McpServer[];
  }) {
    this.proxyId = id;
    this.name = name;
    this.description = description;
    this.mcpServer = new Server(
      {
        name: this.name,
        version: VERSION,
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
    this.throwOnError = !!throwOnError;
    this.targetConfig = targetConfig;
  }

  static async create({
    id,
    name,
    description,
    targets,
    throwOnError,
  }: {
    id: string;
    name: string;
    description?: string;
    targets: McpServer[];
    throwOnError?: boolean;
  }): Promise<ProxyServer> {
    const proxyServer = new ProxyServer({
      id,
      name,
      description,
      throwOnError,
      targetConfig: targets,
    });
    await proxyServer.connectTargets();
    return proxyServer;
  }

  private async connectTargets(): Promise<void> {
    this.targets = await this.createTargets(this.targetConfig);
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
          message: `failed to connect to target ${server.name}`,
          error,
        });
        if (this.throwOnError) {
          throw error;
        }
      }
    }

    return targets;
  }

  private setupHandlers(): void {
    setupToolHandlers(
      this.mcpServer,
      this.targets.map((target) => target.client),
    );
    setupPromptHandlers(
      this.mcpServer,
      this.targets.map((target) => target.client),
    );
    setupResourceHandlers(
      this.mcpServer,
      this.targets.map((target) => target.client),
    );
    setupResourceTemplateHandlers(
      this.mcpServer,
      this.targets.map((target) => target.client),
    );
  }

  getServer(): Server {
    return this.mcpServer;
  }

  public toPlainObject() {
    return {
      id: this.proxyId,
      name: this.name,
      description: this.description,
      servers: this.targets.map((target) => target.toPlainObject()),
    };
  }

  async startSSEConnection(req: express.Request, res: express.Response) {
    const transport = new SSEServerTransport(`/${this.proxyId}/message`, res);

    this.transports.set(transport.sessionId, transport);

    logger.info({
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
      logger.info({
        message: "SSE connection closed",
        sessionId: transport.sessionId,
        proxyId: this.proxyId,
      });
      this.transports.delete(transport.sessionId);
    });

    await this.mcpServer.connect(transport);
  }

  async handleSSEMessage(req: express.Request, res: express.Response) {
    const sessionId = req.query.sessionId?.toString();

    if (!sessionId) {
      // TODO: Add a test case for this.
      throw new AppError(ErrorCode.BAD_REQUEST, "No sessionId provided");
    }
    const body = await parseMCPMessageBody(req);

    logger.info({
      message: "Message received",
      proxyId: this.proxyId,
      sessionId,
      method: body.method,
    });

    const transport = this.transports.get(sessionId);

    if (!transport) {
      // TODO: Add a test case for this.
      logger.warn({
        message: "Transport not found",
        sessionId,
        proxyId: this.proxyId,
      });
      throw new AppError(ErrorCode.NOT_FOUND, "Transport not found");
    }

    await transport.handlePostMessage(req, res, body);
  }

  async close(): Promise<void> {
    logger.info({ message: `shutting down`, proxyId: this.proxyId });

    await Promise.all(this.targets.map((target) => target.close()));
    await this.mcpServer.close();
  }
}
