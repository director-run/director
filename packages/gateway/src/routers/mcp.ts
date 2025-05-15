import { asyncHandler } from "@director.run/utilities/middleware";
import express from "express";
import type { ProxyServerStore } from "../proxy-server-store";

export const createMCPRouter = ({
  proxyStore,
}: {
  proxyStore: ProxyServerStore;
}) => {
  const router = express.Router();

  router.get(
    "/:proxy_id/sse",
    asyncHandler(async (req, res) => {
      const proxyId = req.params.proxy_id;
      const proxy = proxyStore.get(proxyId);
      await proxy.startSSEConnection(req, res);
    }),
  );

  router.post(
    "/:proxy_id/message",
    asyncHandler(async (req, res) => {
      const proxyId = req.params.proxy_id;
      const proxy = proxyStore.get(proxyId);
      await proxy.handleSSEMessage(req, res);
    }),
  );

  return router;
};
