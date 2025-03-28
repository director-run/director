import { getLogger } from "../helpers/logger";

import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { BACKEND_PORT } from "../config";
import { appRouter } from "./router";

const logger = getLogger("server");

// curl --location --globoff 'http://localhost:3000/trpc/greeting?input={%22name%22%3A%22somkiat%22}' \
// --header 'Cookie: Cookie_1=value' | jq

export function startServer() {
  logger.info(`Starting backend server`);

  const app = express();

  app.use(cors());

  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
    }),
  );

  app.listen(BACKEND_PORT, () => {
    logger.info(`Server running at http://localhost:${BACKEND_PORT}`);
  });
}
