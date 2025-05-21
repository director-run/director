import { ErrorCode } from "@director.run/utilities/error";
import { AppError } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { asyncHandler } from "@director.run/utilities/middleware";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import type { ProxyServerStore } from "../proxy-server-store";

const logger = getLogger("mcp");

export const createMCPRouter = ({
  proxyStore,
}: {
  proxyStore: ProxyServerStore;
}) => {
  const router = express.Router();
  const transports: Map<string, StreamableHTTPServerTransport> = new Map();

  router.post(
    "/:proxy_id/mcp",
    asyncHandler(async (req, res) => {
      const proxyId = req.params.proxy_id;
      const proxy = proxyStore.get(proxyId);
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports.has(sessionId)) {
        // Reuse existing transport
        const existingTransport = transports.get(sessionId);
        if (!existingTransport) {
          throw new AppError(ErrorCode.NOT_FOUND, "Transport not found");
        }
        transport = existingTransport;
      } else if (!sessionId && isInitializeRequest(req.body)) {
        // New initialization request
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
          onsessioninitialized: (sessionId) => {
            // Store the transport by session ID
            transports.set(sessionId, transport);
          },
        });

        // Clean up transport when closed
        transport.onclose = () => {
          if (transport.sessionId) {
            transports.delete(transport.sessionId);
          }
        };

        // Connect to the proxy server
        await proxy.connect(transport);
      } else {
        throw new AppError(
          ErrorCode.BAD_REQUEST,
          "No valid session ID provided",
        );
      }

      logger.info({
        message: "MCP message received",
        proxyId: proxy.id,
        sessionId: transport.sessionId,
        method: req.body.method,
      });

      // Handle the request
      await transport.handleRequest(req, res, req.body);
    }),
  );

  // Reusable handler for GET and DELETE requests
  const handleSessionRequest = async (
    req: express.Request,
    res: express.Response,
  ) => {
    const proxyId = req.params.proxy_id;
    const proxy = proxyStore.get(proxyId);
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (!sessionId || !transports.has(sessionId)) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        "Invalid or missing session ID",
      );
    }

    const existingTransport = transports.get(sessionId);
    if (!existingTransport) {
      throw new AppError(ErrorCode.NOT_FOUND, "Transport not found");
    }
    const transport = existingTransport;
    await transport.handleRequest(req, res);
  };

  // Handle GET requests for server-to-client notifications
  router.get("/:proxy_id/mcp", handleSessionRequest);

  // Handle DELETE requests for session termination
  router.delete("/:proxy_id/mcp", handleSessionRequest);

  return router;
};
