import { ErrorCode } from "@director.run/utilities/error";
import { AppError } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { parseMCPMessageBody } from "@director.run/utilities/mcp";
import { asyncHandler } from "@director.run/utilities/middleware";
import { Telemetry } from "@director.run/utilities/telemetry";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import type { ProxyServerStore } from "../proxy-server-store";
import type { StatusChangeEvent, StatusMonitor } from "../status-monitor";

const logger = getLogger("mcp/sse");

export const createSSERouter = ({
  proxyStore,
  telemetry,
  statusMonitor,
}: {
  proxyStore: ProxyServerStore;
  telemetry: Telemetry;
  statusMonitor?: StatusMonitor;
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

      telemetry.trackEvent("connection_started", {
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

      telemetry.trackEvent("method_called", {
        method: body.method,
        transport: "sse",
      });

      await transport.handlePostMessage(req, res, body);
    }),
  );

  // Status events endpoint
  router.get(
    "/status/events",
    asyncHandler(async (req, res) => {
      if (!statusMonitor) {
        throw new AppError(
          ErrorCode.NOT_FOUND,
          "Status monitoring not enabled",
        );
      }

      // Set up SSE headers
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      });

      // Send initial connection event
      res.write(
        `data: ${JSON.stringify({ type: "connected", timestamp: new Date() })}\n\n`,
      );

      const statusChangeHandler = (event: StatusChangeEvent) => {
        const eventData = {
          type: "statusChange",
          ...event,
        };
        res.write(`data: ${JSON.stringify(eventData)}\n\n`);
      };

      // Subscribe to status changes
      statusMonitor.on("statusChange", statusChangeHandler);

      // Handle client disconnect
      req.on("close", () => {
        logger.info({ message: "status events client disconnected" });
        statusMonitor.off("statusChange", statusChangeHandler);
      });

      req.on("error", (error) => {
        logger.error({
          message: "status events client error",
          error,
        });
        statusMonitor.off("statusChange", statusChangeHandler);
      });
    }),
  );

  // Proxy-specific status events endpoint
  router.get(
    "/:proxy_id/status/events",
    asyncHandler(async (req, res) => {
      if (!statusMonitor) {
        throw new AppError(
          ErrorCode.NOT_FOUND,
          "Status monitoring not enabled",
        );
      }

      const proxyId = req.params.proxy_id;

      // Verify proxy exists
      proxyStore.get(proxyId);

      // Set up SSE headers
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      });

      // Send initial connection event
      res.write(
        `data: ${JSON.stringify({ type: "connected", proxyId, timestamp: new Date() })}\n\n`,
      );

      const statusChangeHandler = (event: StatusChangeEvent) => {
        // Only send events for this specific proxy
        if (event.proxyId === proxyId) {
          const eventData = {
            type: "statusChange",
            ...event,
          };
          res.write(`data: ${JSON.stringify(eventData)}\n\n`);
        }
      };

      // Subscribe to status changes
      statusMonitor.on("statusChange", statusChangeHandler);

      // Handle client disconnect
      req.on("close", () => {
        logger.info({
          message: "proxy status events client disconnected",
          proxyId,
        });
        statusMonitor.off("statusChange", statusChangeHandler);
      });

      req.on("error", (error) => {
        logger.error({
          message: "proxy status events client error",
          proxyId,
          error,
        });
        statusMonitor.off("statusChange", statusChangeHandler);
      });
    }),
  );

  return router;
};
