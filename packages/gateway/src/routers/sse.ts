import { ErrorCode } from "@director.run/utilities/error";
import { AppError } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { parseMCPMessageBody } from "@director.run/utilities/mcp";
import { asyncHandler } from "@director.run/utilities/middleware/index";
import { Telemetry } from "@director.run/utilities/telemetry";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import type { PlaybookStore } from "../playbooks/playbook-store";

const logger = getLogger("mcp/sse");

export const createSSERouter = ({
  playbookStore,
  telemetry,
}: {
  playbookStore: PlaybookStore;
  telemetry?: Telemetry;
}) => {
  const router = express.Router();
  const transports: Map<string, SSEServerTransport> = new Map();

  router.get(
    "/:playbook_id/sse",
    asyncHandler(async (req, res) => {
      const playbookId = req.params.playbook_id;
      const playbook = playbookStore.get(playbookId);
      const transport = new SSEServerTransport(`/${playbook.id}/message`, res);

      transports.set(transport.sessionId, transport);

      logger.info({
        message: "SSE connection started",
        sessionId: transport.sessionId,
        playbookId: playbook.id,
        userAgent: req.headers["user-agent"],
        host: req.headers["host"],
      });

      telemetry?.trackEvent("connection_started", {
        transport: "sse",
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
          playbookId: playbook.id,
        });
        transports.delete(transport.sessionId);
      });

      await playbook.connect(transport);
    }),
  );

  router.post(
    "/:playbook_id/message",
    asyncHandler(async (req, res) => {
      const playbookId = req.params.playbook_id;
      const playbook = playbookStore.get(playbookId);
      const sessionId = req.query.sessionId?.toString();

      if (!sessionId) {
        // TODO: Add a test case for this.
        throw new AppError(ErrorCode.BAD_REQUEST, "No sessionId provided");
      }
      const body = await parseMCPMessageBody(req);

      logger.info({
        message: "Message received",
        playbookId: playbook.id,
        sessionId,
        method: body.method,
        params: body.params,
      });

      const transport = transports.get(sessionId);

      if (!transport) {
        // TODO: Add a test case for this.
        logger.warn({
          message: "Transport not found",
          sessionId,
          playbookId: playbook.id,
        });
        throw new AppError(ErrorCode.NOT_FOUND, "Transport not found");
      }

      telemetry?.trackEvent("method_called", {
        method: body.method,
        transport: "sse",
      });

      await transport.handlePostMessage(req, res, body);
    }),
  );

  return router;
};
