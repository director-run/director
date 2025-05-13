import type {
  ProxyAttributes,
  ProxyTargetAttributes,
} from "@director.run/gateway/db/schema";
import { ErrorCode } from "@director.run/utilities/error";
import { AppError } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { parseMCPMessageBody } from "@director.run/utilities/mcp";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import * as eventsource from "eventsource";
import express from "express";
import { z } from "zod";
import packageJson from "../package.json";
import { setupPromptHandlers } from "./handlers/prompts-handler";
import { setupResourceTemplateHandlers } from "./handlers/resource-templates-handler";
import { setupResourceHandlers } from "./handlers/resources-handler";
import { setupToolHandlers } from "./handlers/tools-handler";
import { SimpleClient } from "./simple-client";
import { SimpleServer } from "./simple-server";

global.EventSource = eventsource.EventSource;

const logger = getLogger(`ProxyServer`);

export class ProxyServer extends Server {
  private targets: SimpleClient[];
  public readonly attributes: ProxyAttributes & { useController?: boolean };
  private transports: Map<string, SSEServerTransport>;

  constructor(attributes: ProxyAttributes & { useController?: boolean }) {
    super(
      {
        name: attributes.name,
        version: packageJson.version,
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
        const target = new SimpleClient(server.name);
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

    if (this.attributes.useController) {
      const controllerServer = createControllerServer({ proxy: this });
      const controllerClient =
        await SimpleClient.createAndConnectToServer(controllerServer);

      this.targets.push(controllerClient);
    }

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

function getTransport(targetServer: ProxyTargetAttributes): Transport {
  switch (targetServer.transport.type) {
    case "sse":
      return new SSEClientTransport(new URL(targetServer.transport.url));
    case "stdio":
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
    default:
      throw new Error(`Transport ${targetServer.name} not available.`);
  }
}

function createControllerServer({ proxy }: { proxy: ProxyServer }) {
  const server = new SimpleServer(`${proxy.id}-controller`);
  server
    .tool("list_targets")
    .schema(z.object({}))
    .description("List proxy targets")
    .handle(({}) => {
      return Promise.resolve({
        status: "success",
        data: [
          {
            name: "test",
            description: "test",
            url: "https://github.com/test",
          },
        ],
      });
    });

  return server;
}
