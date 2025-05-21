import { randomUUID } from "node:crypto";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { asyncHandler } from "@director.run/utilities/middleware";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import z from "zod";
import { SimpleServer } from "./simple-server";

const logger = getLogger("request-logger");

function requestLogger(req: Request, res: Response, next: NextFunction) {
  const timestamp = new Date().toISOString();
  logger.info(`${timestamp} ${req.method} ${req.path}`);
  next();
}

function start() {
  const server = new SimpleServer();
  server
    .tool("foo")
    .description("Foo the bar")
    .schema(z.object({ message: z.string() }))
    .handle(({ message }) => Promise.resolve({ message }));
  serveOverStreamable(server, 4522);
}

start();

function serveOverStreamable(server: SimpleServer, port: number) {
  const app = express();
  app.use(express.json());

  // Map to store transports by session ID
  const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};
  app.use(requestLogger);
  app.get(
    "/change",
    asyncHandler(async (req, res) => {
      server
        .tool("morris")
        .description("Morris the cat")
        .schema(z.object({ message: z.string() }))
        .handle(({ message }) => Promise.resolve({ message }));

      console.log("sending tool list changed");

      await server.sendToolListChanged();
      // await server.sendPromptListChanged();
      // await server.sendResourceListChanged();
      // await server.sendResourceUpdated({
      //   uri: "https://example.com",
      //   name: "Example",
      //   type: "file",
      // });

      res.send("Hello, world!");
    }),
  );
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

  const instance = app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });

  return instance;
}
