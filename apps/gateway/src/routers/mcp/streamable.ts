import { ErrorCode } from "@director.run/utilities/error";
import { AppError } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { asyncHandler } from "@director.run/utilities/middleware/index";
import { Telemetry } from "@director.run/utilities/telemetry";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import {
  type AuthenticatedRequest,
  // requireAPIKeyAuth,
} from "../../middleware/auth";
import type { PlaybookStore } from "../../playbooks/playbook-store";

const logger = getLogger("mcp/streamable");

export const createStreamableRouter = ({
  playbookStore,
  telemetry,
}: {
  playbookStore: PlaybookStore;
  telemetry?: Telemetry;
}): express.Router => {
  const router = express.Router();
  const transports: Map<string, StreamableHTTPServerTransport> = new Map();

  // Note: express.json() is applied at the parent MCP router level
  router.post(
    "/:playbook_id/mcp",
    asyncHandler(async (req, res) => {
      const playbookId = req.params.playbook_id;
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.userId;
      const playbook = await playbookStore.get(playbookId, userId);

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
        logger.info(`[${playbook.id}] new initialization request`);
        telemetry?.trackEvent("connection_started", {
          transport: "streamable",
        });
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
          logger.info({
            message: `[${playbook.id}] transport closed`,
            playbookId: playbook.id,
            sessionId: transport.sessionId,
          });
          if (transport.sessionId) {
            transports.delete(transport.sessionId);
          }
        };

        req.socket.on("close", () => {
          logger.info({
            message: `[${playbook.id}] socket closed'`,
            playbookId: playbook.id,
            sessionId: transport.sessionId,
          });
        });
        // Connect to the playbook server
        await playbook.connect(transport);
      } else {
        throw new AppError(
          ErrorCode.BAD_REQUEST,
          "No valid session ID provided",
        );
      }

      logger.info({
        message: `[${playbook.id}] '${req.body.method}' called`,
        playbookId: playbook.id,
        sessionId: transport.sessionId,
        method: req.body.method,
        body: req.body,
      });

      telemetry?.trackEvent("method_called", {
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
      const playbookId = req.params.playbook_id;
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.userId;
      const playbook = await playbookStore.get(playbookId, userId);
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

      logger.info({
        message: `MCP handleSessionRequest`,
        playbookId: playbook.id,
        sessionId: transport.sessionId,
        body: req.body,
      });

      await transport.handleRequest(req, res);
    },
  );

  // Handle GET requests for server-to-client notifications
  router.get("/:playbook_id/mcp", handleSessionRequest);

  // Handle DELETE requests for session termination
  router.delete("/:playbook_id/mcp", handleSessionRequest);

  return router;
};
