import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express, {} from "express";
import { PORT } from "./config";
import { getLogger } from "./helpers/logger";
import { errorRequestHandler } from "./http/middleware";
import { sse } from "./http/routers/sse";
import { appRouter } from "./http/routers/trpc";
import { ProxyServerStore } from "./services/proxy/ProxyServerStore";

const logger = getLogger("startService");

export const startService = async () => {
  const app = express();
  const proxyStore = await ProxyServerStore.create();

  app.use(cors());
  app.use("/", sse({ proxyStore }));
  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
    }),
  );

  app.use(errorRequestHandler);

  const expressServer = app.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
  });

  process.on("SIGINT", async () => {
    logger.info("Received SIGINT, cleaning up proxy servers...");
    await proxyStore.closeAll();
    process.exit(0);
  });

  return expressServer;
};
