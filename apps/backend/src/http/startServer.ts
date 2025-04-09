import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { PORT } from "../constants";
import { getLogger } from "../helpers/logger";
import { ProxyServerStore } from "../services/proxy/ProxyServerStore";
import { sse } from "./routers/sse";
import { appRouter } from "./routers/trpc";

const logger = getLogger("startServer");

export const startServer = async () => {
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
  const expressServer = app.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
  });

  return expressServer;
};
