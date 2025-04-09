import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { DEFAULT_SERVICE_PORT } from "../constants";
import { getLogger } from "../helpers/logger";
import { sse } from "./routers/sse";
import { appRouter } from "./routers/trpc";

const logger = getLogger("startServer");

export const startServer = async () => {
  const app = express();

  app.use(cors());
  app.use("/", await sse());
  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
    }),
  );
  const expressServer = app.listen(DEFAULT_SERVICE_PORT, () => {
    logger.info(`Server running at http://localhost:${DEFAULT_SERVICE_PORT}`);
  });

  return expressServer;
};
