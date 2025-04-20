import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { env } from "./helpers/env";
import { getLogger } from "./helpers/logger";
import { asyncHandler, errorRequestHandler } from "./http/middleware";
import { ProxyServerStore } from "./services/proxy/proxy-server-store";
import { createAppRouter } from "./trpc/routers/_app-router";

const logger = getLogger("startService");

export const startService = async (attribs?: {
  proxyStore?: ProxyServerStore;
}) => {
  logger.info(`starting director...`);

  const app = express();
  const proxyStore = attribs?.proxyStore ?? (await ProxyServerStore.create());

  app.use(cors());

  app.get(
    "/:proxy_id/sse",
    asyncHandler(async (req, res) => {
      const proxyId = req.params.proxy_id;
      const proxy = proxyStore.get(proxyId);
      await proxy.startSSEConnection(req, res);
    }),
  );

  app.post(
    "/:proxy_id/message",
    asyncHandler(async (req, res) => {
      const proxyId = req.params.proxy_id;
      const proxy = proxyStore.get(proxyId);
      await proxy.handleSSEMessage(req, res);
    }),
  );

  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: createAppRouter({ proxyStore }),
    }),
  );

  app.use(errorRequestHandler);

  const expressServer = app.listen(env.SERVER_PORT, () => {
    logger.info(`director running at http://localhost:${env.SERVER_PORT}`);
  });

  process.on("SIGINT", async () => {
    logger.info("received SIGINT, cleaning up proxy servers...");
    await proxyStore.closeAll();
    process.exit(0);
  });

  return expressServer;
};
