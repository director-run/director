import { ErrorCode } from "@director.run/utilities/error";
import { AppError } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { parseMCPMessageBody } from "@director.run/utilities/mcp";
import { asyncHandler } from "@director.run/utilities/middleware";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import type { ProxyServerStore } from "../proxy-server-store";

const logger = getLogger("mcp/sse");

export const createSSERouter = ({
  proxyStore,
}: {
  proxyStore: ProxyServerStore;
}) => {
  const router = express.Router();
  const transports: Map<string, SSEServerTransport> = new Map();

  router.get(
    "/:proxy_id/sse",
    asyncHandler(async (req, res) => {
      const proxyId = req.params.proxy_id;
      const proxy = proxyStore.get(proxyId);
      const transport = new SSEServerTransport(`/${proxy.id}/message`, res);

      transports.set(transport.sessionId, transport);

      logger.info({
        message: "SSE connection started",
        sessionId: transport.sessionId,
        proxyId: proxy.id,
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
          proxyId: proxy.id,
        });
        transports.delete(transport.sessionId);
      });

      await proxy.connect(transport);
    }),
  );

  router.post(
    "/:proxy_id/message",
    asyncHandler(async (req, res) => {
      const proxyId = req.params.proxy_id;
      const proxy = proxyStore.get(proxyId);
      const sessionId = req.query.sessionId?.toString();

      if (!sessionId) {
        // TODO: Add a test case for this.
        throw new AppError(ErrorCode.BAD_REQUEST, "No sessionId provided");
      }
      const body = await parseMCPMessageBody(req);

      logger.info({
        message: "Message received",
        proxyId: proxy.id,
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
          proxyId: proxy.id,
        });
        throw new AppError(ErrorCode.NOT_FOUND, "Transport not found");
      }

      await transport.handlePostMessage(req, res, body);
    }),
  );

  return router;
};
