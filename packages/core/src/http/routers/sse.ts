import express from "express";
import type { Router } from "express";
import type { ProxyServerStore } from "../../services/proxy/proxy-server-store";
import { asyncHandler } from "../middleware";

export function sse({ proxyStore }: { proxyStore: ProxyServerStore }): Router {
  const router = express.Router();

  router.get(
    "/:proxy_id/sse",
    asyncHandler(async (req, res) => {
      const proxyId = req.params.proxy_id;
      const proxyInstance = proxyStore.get(proxyId);
      await proxyInstance.startSSEConnection(req, res);
    }),
  );

  router.post(
    "/:proxy_id/message",
    asyncHandler(async (req, res) => {
      const proxyId = req.params.proxy_id;
      const proxyInstance = proxyStore.get(proxyId);
      await proxyInstance.handleSSEMessage(req, res);
    }),
  );

  return router;
}
