import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import type { Router } from "express";
import { AppError, ErrorCode } from "../../helpers/error";
import { getLogger } from "../../helpers/logger";
import { parseMCPMessageBody } from "../../helpers/mcp";
import type { ProxyServerStore } from "../../services/proxy/ProxyServerStore";
import { asyncHandler } from "../middleware";

const logger = getLogger("routers/sse");

export function sse({ proxyStore }: { proxyStore: ProxyServerStore }): Router {
  const router = express.Router();

  router.get(
    "/:proxy_id/sse",
    asyncHandler(async (req, res) => {
      const proxyId = req.params.proxy_id;
      const proxyInstance = proxyStore.get(proxyId);
      const transport = new SSEServerTransport(`/${proxyId}/message`, res);

      proxyInstance.getTransports().set(transport.sessionId, transport);

      logger.info({
        message: "SSE connection started",
        sessionId: transport.sessionId,
        proxyId,
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
          proxyId,
        });
        proxyInstance.getTransports().delete(transport.sessionId);
      });

      await proxyInstance.getServer().connect(transport);
    }),
  );

  router.post(
    "/:proxy_id/message",
    asyncHandler(async (req, res) => {
      const proxyId = req.params.proxy_id;
      const sessionId = req.query.sessionId?.toString();
      const proxyInstance = proxyStore.get(proxyId);

      if (!sessionId) {
        // TODO: Add a test case for this.
        throw new AppError(ErrorCode.BAD_REQUEST, "No sessionId provided");
      }
      const body = await parseMCPMessageBody(req);

      logger.info({
        message: "Message received",
        proxyId,
        sessionId,
        method: body.method,
      });

      const transport = proxyInstance.getTransports().get(sessionId);

      if (!transport) {
        // TODO: Add a test case for this.
        logger.warn({
          message: "Transport not found",
          sessionId,
          proxyId,
        });
        throw new AppError(ErrorCode.NOT_FOUND, "Transport not found");
      }

      await transport.handlePostMessage(req, res, body);
    }),
  );

  return router;
}
