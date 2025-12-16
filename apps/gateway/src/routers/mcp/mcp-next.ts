import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { asyncHandler } from "@director.run/utilities/middleware/index";
import { Telemetry } from "@director.run/utilities/telemetry";
import { joinURL } from "@director.run/utilities/url";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import { auth } from "../../auth";
import { env } from "../../env";
import type { PlaybookStore } from "../../playbooks/playbook-store";

const logger = getLogger("mcp/mcp-next");

/**
 * OAuth session from better-auth MCP plugin.
 * Contains the access token record with scopes and user ID.
 */
interface McpSession {
  userId: string;
  scopes: string;
  clientId: string;
}

/**
 * Express Request with authenticated MCP OAuth session.
 */
interface McpAuthenticatedRequest extends express.Request {
  mcpSession: McpSession;
}

/**
 * Middleware that authenticates requests using OAuth via better-auth MCP plugin.
 *
 * Returns 401 with WWW-Authenticate header if no valid token is present.
 * This follows the MCP OAuth specification (RFC 9728).
 */
function requireMcpOAuth() {
  return async (
    req: express.Request & { mcpSession?: McpSession },
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      // Get MCP session from OAuth token
      const session = await auth.api.getMcpSession({
        headers: req.headers as Record<string, string>,
      });

      if (!session) {
        // Return 401 with WWW-Authenticate header per MCP OAuth spec (RFC 9728)
        // Clients expect well-known endpoints at root level
        // Use joinURL to avoid double slashes when BASE_URL has trailing slash
        const resourceMetadataUrl = joinURL(
          env.BASE_URL,
          ".well-known/oauth-protected-resource",
        );
        res.setHeader(
          "WWW-Authenticate",
          `Bearer resource_metadata="${resourceMetadataUrl}"`,
        );
        res.status(401).json({
          error: "unauthorized",
          error_description: "OAuth authentication required",
        });
        return;
      }

      // Attach session to request
      req.mcpSession = session as McpSession;
      next();
    } catch (error) {
      logger.error({ message: "OAuth authentication error", error });
      // Return 401 with proper header even on errors (RFC 9728)
      // Use joinURL to avoid double slashes when BASE_URL has trailing slash
      const resourceMetadataUrl = joinURL(
        env.BASE_URL,
        ".well-known/oauth-protected-resource",
      );
      res.setHeader(
        "WWW-Authenticate",
        `Bearer resource_metadata="${resourceMetadataUrl}"`,
      );
      res.status(401).json({
        error: "invalid_token",
        error_description: "Failed to validate access token",
      });
    }
  };
}

/**
 * Creates the OAuth-protected MCP router for the new `/mcp-next` endpoint.
 *
 * This endpoint uses OAuth 2.0 authentication instead of API keys.
 * MCP clients will discover the OAuth server via the WWW-Authenticate header
 * and complete the OAuth flow before accessing playbooks.
 */
export function createMcpNextRouter({
  playbookStore,
  telemetry,
}: {
  playbookStore: PlaybookStore;
  telemetry?: Telemetry;
}): express.Router {
  const router = express.Router();
  const transports: Map<string, StreamableHTTPServerTransport> = new Map();

  // Note: express.json() is applied at the parent MCP router level

  // Apply OAuth authentication middleware
  router.use("/:playbook_id/mcp-next", requireMcpOAuth());

  // Handle POST requests for MCP messages
  router.post(
    "/:playbook_id/mcp-next",
    asyncHandler(async (req, res) => {
      const playbookId = req.params.playbook_id;
      const authReq = req as McpAuthenticatedRequest;
      const userId = authReq.mcpSession.userId;

      // Get playbook for this user
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
        logger.info(`[${playbook.id}] new OAuth MCP initialization request`);
        telemetry?.trackEvent("connection_started", {
          transport: "streamable-oauth",
        });

        // New initialization request
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
          onsessioninitialized: (sessionId) => {
            transports.set(sessionId, transport);
          },
        });

        // Clean up transport when closed
        transport.onclose = () => {
          logger.info({
            message: `[${playbook.id}] OAuth MCP transport closed`,
            playbookId: playbook.id,
            sessionId: transport.sessionId,
          });
          if (transport.sessionId) {
            transports.delete(transport.sessionId);
          }
        };

        req.socket.on("close", () => {
          logger.info({
            message: `[${playbook.id}] OAuth MCP socket closed`,
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
        message: `[${playbook.id}] OAuth MCP '${req.body.method}' called`,
        playbookId: playbook.id,
        sessionId: transport.sessionId,
        method: req.body.method,
      });

      telemetry?.trackEvent("method_called", {
        method: req.body.method,
        transport: "streamable-oauth",
      });

      // Handle the request
      await transport.handleRequest(req, res, req.body);
    }),
  );

  // Reusable handler for GET and DELETE requests
  const handleSessionRequest = asyncHandler(
    async (req: express.Request, res: express.Response) => {
      const playbookId = req.params.playbook_id;
      const authReq = req as McpAuthenticatedRequest;
      const userId = authReq.mcpSession.userId;

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
        message: `OAuth MCP handleSessionRequest`,
        playbookId: playbook.id,
        sessionId: transport.sessionId,
        body: req.body,
      });

      await transport.handleRequest(req, res);
    },
  );

  // Handle GET requests for server-to-client notifications
  router.get("/:playbook_id/mcp-next", handleSessionRequest);

  // Handle DELETE requests for session termination
  router.delete("/:playbook_id/mcp-next", handleSessionRequest);

  return router;
}
