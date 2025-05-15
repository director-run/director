import { Server } from "http";
import { getLogger } from "@director.run/utilities/logger";
import { errorRequestHandler } from "@director.run/utilities/middleware";
import cors from "cors";
import express from "express";
import { type Store, makeStore } from "./db/store";
import { createTRPCExpressMiddleware } from "./routers/trpc";

const logger = getLogger("registry");

export class Registry {
  public readonly port: number;
  private server: Server;
  public readonly store: Store;

  private constructor(attribs: {
    port: number;
    server: Server;
    store: Store;
  }) {
    this.port = attribs.port;
    this.server = attribs.server;
    this.store = attribs.store;
  }

  public static async start(attribs: {
    port: number;
    connectionString?: string;
  }) {
    logger.info(`starting registry...`);

    const app = express();
    const store = makeStore();

    app.use(cors());
    app.use(express.json());
    app.use("/trpc", createTRPCExpressMiddleware({ store }));
    app.use(errorRequestHandler);

    const server = app.listen(attribs.port, () => {
      logger.info(`registry running on port ${attribs.port}`);
    });

    const registry = new Registry({
      port: attribs.port,
      server,
      store,
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
