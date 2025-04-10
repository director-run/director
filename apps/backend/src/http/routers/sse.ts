import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import type { Router } from "express";
import { getLogger } from "../../helpers/logger";
import type { ProxyServerStore } from "../../services/proxy/ProxyServerStore";
import { asyncHandler } from "../middleware";

const logger = getLogger("SSE Router");

export function sse({ proxyStore }: { proxyStore: ProxyServerStore }): Router {
  const router = express.Router();

  router.get(
    "/:proxy_name/sse",
    asyncHandler(async (req, res) => {
      const proxyName = req.params.proxy_name;
      logger.info({
        message: "GET /:proxy_name/sse",
        proxyName,
      });

      const proxyInstance = await proxyStore.get(proxyName);
      const transport = new SSEServerTransport(`/${proxyName}/message`, res);

      proxyInstance.transports.set(transport.sessionId, transport);

      res.on("close", () => {
        logger.info(
          `SSE connection closed for ${proxyName}, sessionId: ${transport.sessionId}`,
        );
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

      logger.info({
        message: "POST /:proxy_name/message",
        proxyName,
        sessionId,
      });

      const proxyInstance = await proxyStore.get(proxyName);

      if (!sessionId) {
        logger.warn("No sessionId provided");
        res.status(400).send("No sessionId provided");
        return;
      }

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
