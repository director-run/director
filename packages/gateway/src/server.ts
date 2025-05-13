import { getLogger } from "@director.run/utilities/logger";
import {
  asyncHandler,
  errorRequestHandler,
} from "@director.run/utilities/middleware";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { Database } from "./db";
import { ProxyServerStore } from "./proxy-server-store";
import { createAppRouter } from "./trpc/routers/_app-router";

const logger = getLogger("startService");

export const startService = async (attribs: {
  proxyStore?: ProxyServerStore;
  port: number;
  databaseFilePath: string;
}) => {
  logger.info(`starting director...`);

  const app = express();
  const proxyStore =
    attribs?.proxyStore ??
    (await ProxyServerStore.create(
      await Database.connect(attribs.databaseFilePath),
    ));

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

  const expressServer = app.listen(attribs?.port, () => {
    logger.info(
      `director gateway running at http://localhost:${attribs?.port}`,
    );
  });

  process.on("SIGINT", async () => {
    logger.info("received SIGINT, cleaning up proxy servers...");
    await proxyStore.closeAll();
    process.exit(0);
  });

  return expressServer;
};
