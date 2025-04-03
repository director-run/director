import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { BACKEND_PORT } from "./config";
import { getLogger } from "./helpers/logger";
import { sse } from "./http/routers/sse";
import { appRouter } from "./http/routers/trpc";

const logger = getLogger("startServer");

export const startServer = async () => {
  const app = express();

  app.use(cors());
  app.use("/", sse());
  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
    }),
  );
  const expressServer = app.listen(BACKEND_PORT, () => {
    logger.info(`Server running at http://localhost:${BACKEND_PORT}`);
  });

  return expressServer;
};
