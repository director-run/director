import { CONFIG_FILE_PATH, getLogger, readConfig } from "@director/core";
import {} from "@director/core";
import * as trpcExpress from "@trpc/server/adapters/express";
import { Command } from "commander";
import cors from "cors";
import express from "express";
import { appRouter } from "../trpc/router";

const config = await readConfig(CONFIG_FILE_PATH);
const program = new Command();

const logger = getLogger("cli");

// curl --location --globoff 'http://localhost:3000/trpc/greeting?input={%22name%22%3A%22somkiat%22}' \
// --header 'Cookie: Cookie_1=value' | jq

// Print out the full command that was called with all arguments
logger.info(`Hello backend`);

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
  console.log(`Server running at http://localhost:${port}`);
});

export function startServer() {}
