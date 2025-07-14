import { ErrorCode } from "@director.run/utilities/error";
import { AppError } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { asyncHandler } from "@director.run/utilities/middleware";
import { Telemetry } from "@director.run/utilities/telemetry";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import type { ProxyServerStore } from "../proxy-server-store";

const logger = getLogger("mcp/streamable");

export const createStreamableRouter = ({
  proxyStore,
  telemetry,
}: {
  proxyStore: ProxyServerStore;
  telemetry: Telemetry;
}) => {
  const router = express.Router();
  const transports: Map<string, StreamableHTTPServerTransport> = new Map();
  const sessionLastActivity: Map<string, number> = new Map();

  // Clean up stale sessions every 5 minutes
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    const staleSessionIds: string[] = [];

    for (const [sessionId, lastActivity] of sessionLastActivity.entries()) {
      if (now - lastActivity > SESSION_TIMEOUT) {
        staleSessionIds.push(sessionId);
      }
    }

    for (const sessionId of staleSessionIds) {
      logger.info(`cleaning up stale session: ${sessionId}`);
      const transport = transports.get(sessionId);
      if (transport) {
        transport.close();
      }
      transports.delete(sessionId);
      sessionLastActivity.delete(sessionId);
    }

    if (staleSessionIds.length > 0) {
      logger.info(`cleaned up ${staleSessionIds.length} stale sessions`);
    }
  }, CLEANUP_INTERVAL);
  // router.get(
  //   "/status",
  //   asyncHandler((req, res) => {
  //     // iterate over all transports and get the status of each transport
  //     // console.log("--------------------------------");
  //     // console.log("--------------------------------");
  //     // console.log("--------------------------------");

  //     // console.log("Transports:");
  //     // for (const sessionId of transports.keys()) {
  //     //   const transport = transports.get(sessionId);
  //     //   console.log(sessionId);
  //     // }
  //     // console.log("--------------------------------");
  //     // console.log("--------------------------------");
  //     // console.log("--------------------------------");

  //     res.json({
  //       status: "ok",
  //       transports: Array.from(transports.keys()),
  //     });
  //   }),
  // );

  router.use(express.json());
  router.post(
    "/:proxy_id/mcp",
    asyncHandler(async (req, res) => {
      const proxyId = req.params.proxy_id;
      const proxy = await proxyStore.get(proxyId);

      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports.has(sessionId)) {
        // Reuse existing transport
        const existingTransport = transports.get(sessionId);
        if (!existingTransport) {
          throw new AppError(ErrorCode.NOT_FOUND, "Transport not found");
        }
        transport = existingTransport;
        // Update session activity
        sessionLastActivity.set(sessionId, Date.now());
      } else if (isInitializeRequest(req.body)) {
        // Allow re-initialization even if session ID is provided but invalid
        if (sessionId) {
          logger.info(
            `[${proxy.id}] re-initializing session with invalid/expired session ID: ${sessionId}`,
          );
        } else {
          logger.info(`[${proxy.id}] new initialization request`);
        }
        telemetry.trackEvent("connection_started", {
          transport: "streamable",
        });
        // New initialization request
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
          onsessioninitialized: (sessionId) => {
            // Store the transport by session ID
            transports.set(sessionId, transport);
            sessionLastActivity.set(sessionId, Date.now());
          },
        });

        // Clean up transport when closed
        transport.onclose = () => {
          logger.info(`[${proxy.id}] transport closed`, {
            proxyId: proxy.id,
            sessionId: transport.sessionId,
          });
          if (transport.sessionId) {
            transports.delete(transport.sessionId);
            sessionLastActivity.delete(transport.sessionId);
          }
        };

        req.socket.on("close", () => {
          logger.info(`[${proxy.id}] socket closed'`, {
            proxyId: proxy.id,
            sessionId: transport.sessionId,
          });
        });
        // Connect to the proxy server
        await proxy.connect(transport);
      } else {
        throw new AppError(
          ErrorCode.BAD_REQUEST,
          "No valid session ID provided",
        );
      }

      logger.info({
        message: `[${proxy.id}] '${req.body.method}' called`,
        proxyId: proxy.id,
        sessionId: transport.sessionId,
        method: req.body.method,
        body: req.body,
      });

      telemetry.trackEvent("method_called", {
        method: req.body.method,
        transport: "streamable",
      });

      // Handle the request
      await transport.handleRequest(req, res, req.body);
    }),
  );

  // Reusable handler for GET and DELETE requests
  const handleSessionRequest = asyncHandler(
    async (req: express.Request, res: express.Response) => {
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

      // Update session activity
      sessionLastActivity.set(sessionId, Date.now());

      logger.info({
        message: `MCP handleSessionRequest`,
        proxyId: proxy.id,
        sessionId: transport.sessionId,
        body: req.body,
      });

      await transport.handleRequest(req, res);
    },
  );

  // Handle GET requests for server-to-client notifications
  router.get("/:proxy_id/mcp", handleSessionRequest);

  // Handle DELETE requests for session termination
  router.delete("/:proxy_id/mcp", handleSessionRequest);

  return router;
};
