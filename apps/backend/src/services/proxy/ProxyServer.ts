import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import * as eventsource from "eventsource";
import express from "express";
import { PORT, VERSION } from "../../config";
import { ErrorCode } from "../../helpers/error";
import { AppError } from "../../helpers/error";
import { getLogger } from "../../helpers/logger";
import { parseMCPMessageBody } from "../../helpers/mcp";
import type { McpServer, Proxy as ProxyAttributes } from "../db/schema";
import { ConnectedClient } from "./ConnectedClient";
import { ControllerClient } from "./ControllerClient";
import { setupPromptHandlers } from "./handlers/promptsHandler";
import { setupResourceTemplateHandlers } from "./handlers/resourceTemplatesHandler";
import { setupResourceHandlers } from "./handlers/resourcesHandler";
import { setupToolHandlers } from "./handlers/toolsHandler";

global.EventSource = eventsource.EventSource;

const logger = getLogger(`ProxyServer`);

class PServer extends Server {
  private targets: ConnectedClient[];
  private attributes: ProxyAttributes;
  private transports: Map<string, SSEServerTransport>;

  constructor(attributes: ProxyAttributes) {
    super(
      {
        name: attributes.name,
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
    this.attributes = attributes;
    this.transports = new Map<string, SSEServerTransport>();
  }

  public async connectTargets(
    { throwOnError } = { throwOnError: false },
  ): Promise<void> {
    for (const server of this.attributes.servers) {
      try {
        const target = new ConnectedClient(server.name);
        await target.connect(getTransport(server));
        this.targets.push(target);
      } catch (error) {
        logger.error({
          message: `failed to connect to target ${server.name}`,
          error,
        });
        if (throwOnError) {
          throw error;
        }
      }
    }

    // Add controller server to targets
    const controller = new ControllerClient();
    await controller.connect();
    this.targets.push(controller);

    // Setup handlers
    setupToolHandlers(this, this.targets);
    setupPromptHandlers(this, this.targets);
    setupResourceHandlers(this, this.targets);
    setupResourceTemplateHandlers(this, this.targets);
  }

  public toPlainObject() {
    return this.attributes;
  }

  get id() {
    return this.attributes.id;
  }

  get sseUrl() {
    return `http://localhost:${PORT}/${this.attributes.id}/sse`;
  }

  async close(): Promise<void> {
    logger.info({ message: `shutting down`, proxyId: this.id });

    await Promise.all(this.targets.map((target) => target.close()));
    await super.close();
  }

  async startSSEConnection(req: express.Request, res: express.Response) {
    const transport = new SSEServerTransport(`/${this.id}/message`, res);

    this.transports.set(transport.sessionId, transport);

    logger.info({
      message: "SSE connection started",
      sessionId: transport.sessionId,
      proxyId: this.id,
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
        proxyId: this.id,
      });
      this.transports.delete(transport.sessionId);
    });

    await this.connect(transport);
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
      proxyId: this.id,
      sessionId,
      method: body.method,
    });

    const transport = this.transports.get(sessionId);

    if (!transport) {
      // TODO: Add a test case for this.
      logger.warn({
        message: "Transport not found",
        sessionId,
        proxyId: this.id,
      });
      throw new AppError(ErrorCode.NOT_FOUND, "Transport not found");
    }

    await transport.handlePostMessage(req, res, body);
  }
}

export class ProxyServer {
  private mcpServer: PServer;
  // private transports: Map<string, SSEServerTransport>;

  get id() {
    return this.mcpServer.id;
  }

  get sseUrl() {
    return this.mcpServer.sseUrl;
  }

  constructor({
    id,
    name,
    description,
    targetConfig,
  }: {
    id: string;
    name: string;
    description?: string;
    targetConfig: McpServer[];
  }) {
    this.mcpServer = new PServer({
      id,
      name,
      description,
      servers: targetConfig,
    });
    // this.transports = new Map<string, SSEServerTransport>();
  }

  public async connectTargets(
    { throwOnError } = { throwOnError: false },
  ): Promise<void> {
    await this.mcpServer.connectTargets({ throwOnError });
  }

  getServer(): Server {
    return this.mcpServer;
  }

  public toPlainObject() {
    return this.mcpServer.toPlainObject();
  }

  async startSSEConnection(req: express.Request, res: express.Response) {
    this.mcpServer.startSSEConnection(req, res);
  }

  async handleSSEMessage(req: express.Request, res: express.Response) {
    this.mcpServer.handleSSEMessage(req, res);
  }

  async close(): Promise<void> {
    await this.mcpServer.close();
  }
}

export function getTransport(targetServer: McpServer): Transport {
  if (targetServer.transport.type === "sse") {
    return new SSEClientTransport(new URL(targetServer.transport.url));
  } else if (targetServer.transport.type === "stdio") {
    return new StdioClientTransport({
      command: targetServer.transport.command,
      args: targetServer.transport.args,
      env: targetServer.transport.env
        ? targetServer.transport.env.reduce(
            (_, v) => ({
              [v]: process.env[v] || "",
            }),
            {},
          )
        : undefined,
    });
  } else {
    throw new Error(`Transport ${targetServer.name} not available.`);
  }
}
