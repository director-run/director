import { Server } from "http";
import { isProduction } from "@director.run/utilities/env";
import { getLogger } from "@director.run/utilities/logger";
import { errorRequestHandler } from "@director.run/utilities/middleware";
import { notFoundHandler } from "@director.run/utilities/middleware";
import cors from "cors";
import express, { type Express } from "express";
import { type Store, createStore } from "./db/store";
import { createTRPCExpressMiddleware } from "./routers/trpc";

const logger = getLogger("registry");

export class Registry {
  public readonly port: number;
  private server: Server;
  public readonly store: Store;
  public readonly app: Express;

  private constructor(params: {
    port: number;
    server: Server;
    app: Express;
    store: Store;
  }) {
    this.port = params.port;
    this.server = params.server;
    this.store = params.store;
    this.app = params.app;
  }

  public static start(params: {
    port: number;
    connectionString: string;
  }) {
    logger.info(`starting registry...`);

    const app = express();
    const store = createStore({ connectionString: params.connectionString });

    app.use(cors());
    app.use(express.json());
    app.use("/trpc", createTRPCExpressMiddleware({ store }));

    if (isProduction()) {
      app.get("*", (req, res) => res.redirect("https://director.run"));
    }

    app.post("*", notFoundHandler);
    app.use(errorRequestHandler);

    const server = app.listen(params.port, () => {
      logger.info(`registry running on port ${params.port}`);
    });

    const registry = new Registry({
      port: params.port,
      server,
      store,
      app,
    });

    process.on("SIGINT", async () => {
      logger.info("received SIGINT, shutting down registry...");
      await registry.stop();
      process.exit(0);
    });

    return registry;
  }

  async stop() {
    await this.store.close();
    await new Promise<void>((resolve) => {
      this.server.close(() => resolve());
    });
  }
}
