import { getLogger } from "../helpers/logger";

import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { appRouter } from "../trpc/router";

const logger = getLogger("server");

// curl --location --globoff 'http://localhost:3000/trpc/greeting?input={%22name%22%3A%22somkiat%22}' \
// --header 'Cookie: Cookie_1=value' | jq

// Print out the full command that was called with all arguments

export function startServer() {
  logger.info(`Starting backend server`);

  const app = express();
  const port = 3000;

  app.use(cors());

  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
    }),
  );

  app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`);
  });
}
