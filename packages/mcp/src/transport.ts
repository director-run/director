import { randomUUID } from "node:crypto";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import { ProxyServer } from "./proxy-server";

export function serveOverSSE(server: Server, port: number) {
  const app = express();

  let transport: SSEServerTransport;

  app.get("/sse", async (req, res) => {
    transport = new SSEServerTransport("/message", res);
    await server.connect(transport);
  });

  app.post("/message", async (req, res) => {
    await transport.handlePostMessage(req, res);
  });

  const instance = app.listen(port);
  return instance;
}

export async function serveOverStdio(server: Server) {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.on("SIGINT", async () => {
    await transport.close();
    await server.close();
    process.exit(0);
  });
}

export async function proxySSEToStdio(sseUrl: string) {
  try {
    const proxy = new ProxyServer({
      id: "sse2stdio",
      name: "sse2stdio",
      servers: [
        {
          name: "director-sse",
          transport: {
            type: "http",
            url: sseUrl,
          },
        },
      ],
    });

    await proxy.connectTargets({ throwOnError: true });
    await serveOverStdio(proxy);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export function serveOverStreamable(server: Server, port: number) {
  const app = express();
  app.use(express.json());

  // Map to store transports by session ID
  const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  // Handle POST requests for client-to-server communication
  app.post("/mcp", async (req, res) => {
    // Check for existing session ID
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          // Store the transport by session ID
          transports[sessionId] = transport;
        },
      });

      // Clean up transport when closed
      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };

      // Connect to the MCP server
      await server.connect(transport);
    } else {
      // Invalid request
      // TODO: is this format used by the MCP client?
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid session ID provided",
        },
        id: null,
      });
      return;
    }

    // Handle the request
    await transport.handleRequest(req, res, req.body);
  });

  // Reusable handler for GET and DELETE requests
  const handleSessionRequest = async (
    req: express.Request,
    res: express.Response,
  ) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        "Invalid or missing session ID",
      );
    }

    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  };

  // Handle GET requests for server-to-client notifications via SSE
  app.get("/mcp", handleSessionRequest);

  // Handle DELETE requests for session termination
  app.delete("/mcp", handleSessionRequest);

  const instance = app.listen(port);

  return instance;
}
