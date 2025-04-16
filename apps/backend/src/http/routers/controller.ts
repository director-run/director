import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import type { Router } from "express";
import type { ProxyServerStore } from "../../services/proxy/ProxyServerStore";
import { createControllerServer } from "../../services/proxy/createControllerServer";
import { asyncHandler } from "../middleware";

export function controller({
  proxyStore,
}: { proxyStore: ProxyServerStore }): Router {
  const router = express.Router();
  const controllerServer = createControllerServer();

  let transport: SSEServerTransport;

  router.get(
    "/controller/sse",
    asyncHandler(async (req, res) => {
      transport = new SSEServerTransport("/controller/message", res);
      await controllerServer.connect(transport);
    }),
  );

  router.post(
    "/controller/message",
    asyncHandler(async (req, res) => {
      await transport.handlePostMessage(req, res);
    }),
  );

  return router;
}
