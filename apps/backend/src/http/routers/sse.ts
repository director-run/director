import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import type { Router } from "express";
import { getLogger } from "../../helpers/logger";
import type { ProxyServerStore } from "../../services/proxy/ProxyServerStore";
import { asyncHandler } from "../middleware";

const logger = getLogger("routers/sse");

export function sse({ proxyStore }: { proxyStore: ProxyServerStore }): Router {
  const router = express.Router();

  router.get(
    "/:proxy_name/sse",
    asyncHandler(async (req, res) => {
      const proxyName = req.params.proxy_name;
      const proxyInstance = await proxyStore.get(proxyName);
      const transport = new SSEServerTransport(`/${proxyName}/message`, res);

      proxyInstance.transports.set(transport.sessionId, transport);

      logger.info({
        message: "SSE connection started",
        sessionId: transport.sessionId,
        proxyName,
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
          proxyName,
        });
        proxyInstance.transports.delete(transport.sessionId);
      });

      await proxyInstance.server.connect(transport);
    }),
  );

  router.post(
    "/:proxy_name/message",
    asyncHandler(async (req, res) => {
      const proxyName = req.params.proxy_name;
      const sessionId = req.query.sessionId?.toString();
      const proxyInstance = await proxyStore.get(proxyName);

      if (!sessionId) {
        logger.warn("No sessionId provided");
        res.status(400).send("No sessionId provided");
        return;
      }

      logger.info({
        message: "Message received",
        proxyName,
        sessionId,
      });

      const transport = proxyInstance.transports.get(sessionId);
      if (!transport) {
        logger.warn(
          `Transport not found for connectionId '${sessionId}' for proxy '${proxyName}'`,
        );
        res
          .status(404)
          .send(
            `Transport not found for connectionId '${sessionId}' for proxy '${proxyName}'`,
          );
        return;
      }

      await transport.handlePostMessage(req, res);
    }),
  );

  return router;
}
