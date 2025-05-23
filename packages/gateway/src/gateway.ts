import { Server } from "http";
import { getLogger } from "@director.run/utilities/logger";
import {
  errorRequestHandler,
  notFoundHandler,
} from "@director.run/utilities/middleware";
import { logRequests } from "@director.run/utilities/middleware";
import cors from "cors";
import express from "express";
import { Database } from "./db";
import { ProxyServerStore } from "./proxy-server-store";
import { createSSERouter } from "./routers/sse";
import { createStreamableRouter } from "./routers/streamable";
import { createTRPCExpressMiddleware } from "./routers/trpc";

const logger = getLogger("Gateway");

export class Gateway {
  public readonly proxyStore: ProxyServerStore;
  public readonly port: number;
  private server: Server;
  private registryURL: string;
  private constructor(attribs: {
    proxyStore: ProxyServerStore;
    port: number;
    db: Database;
    server: Server;
    registryURL: string;
  }) {
    this.port = attribs.port;
    this.proxyStore = attribs.proxyStore;
    this.server = attribs.server;
    this.registryURL = attribs.registryURL;
  }

  public static async start(attribs: {
    port: number;
    databaseFilePath: string;
    registryURL: string;
  }) {
    logger.info(`starting director gateway`);

    const db = await Database.connect(attribs.databaseFilePath);
    const proxyStore = await ProxyServerStore.create(db);
    const app = express();
    const registryURL = attribs.registryURL;

    app.use(cors());
    app.use(logRequests());
    app.use("/", createSSERouter({ proxyStore }));
    app.use("/", createStreamableRouter({ proxyStore }));
    app.use("/trpc", createTRPCExpressMiddleware({ proxyStore, registryURL }));
    app.all("*", notFoundHandler);
    app.use(errorRequestHandler);

    const server = app.listen(attribs.port, () => {
      logger.info(`director gateway running on port ${attribs.port}`);
    });

    const gateway = new Gateway({
      port: attribs.port,
      db,
      proxyStore,
      server,
      registryURL: attribs.registryURL,
    });

    process.on("SIGINT", async () => {
      logger.info("received SIGINT, cleaning up proxy servers...");
      await gateway.stop();
      process.exit(0);
    });

    return gateway;
  }

  async stop() {
    await this.proxyStore.closeAll();
    await new Promise<void>((resolve) => {
      this.server.close(() => resolve());
    });
  }
}
