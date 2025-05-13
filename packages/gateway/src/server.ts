import { Server } from "http";
import { getLogger } from "@director.run/utilities/logger";
import {
  asyncHandler,
  errorRequestHandler,
} from "@director.run/utilities/middleware";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import { Database } from "./db";
import { ProxyServerStore } from "./proxy-server-store";
import { createAppRouter } from "./trpc/routers/_app-router";

const logger = getLogger("startService");

export const startService = async (attribs: {
  port: number;
  databaseFilePath: string;
}) => {
  const gateway = await GatewayService.create(attribs);
  await gateway.start();
  return gateway;
};

class GatewayService {
  public readonly proxyStore: ProxyServerStore;
  public readonly port: number;
  private db: Database;
  private expressServer?: Server;

  private constructor(attribs: {
    proxyStore: ProxyServerStore;
    port: number;
    db: Database;
  }) {
    this.port = attribs.port;
    this.db = attribs.db;
    this.proxyStore = attribs.proxyStore;
  }

  public static async create(attribs: {
    port: number;
    databaseFilePath: string;
  }) {
    const db = await Database.connect(attribs.databaseFilePath);
    const proxyStore = await ProxyServerStore.create(db);

    return new GatewayService({
      port: attribs.port,
      db,
      proxyStore,
    });
  }

  public async start() {
    logger.info(`starting director...`);

    const app = express();

    app.use(cors());

    app.get(
      "/:proxy_id/sse",
      asyncHandler(async (req, res) => {
        const proxyId = req.params.proxy_id;
        const proxy = this.proxyStore.get(proxyId);
        await proxy.startSSEConnection(req, res);
      }),
    );

    app.post(
      "/:proxy_id/message",
      asyncHandler(async (req, res) => {
        const proxyId = req.params.proxy_id;
        const proxy = this.proxyStore.get(proxyId);
        await proxy.handleSSEMessage(req, res);
      }),
    );

    app.use(
      "/trpc",
      trpcExpress.createExpressMiddleware({
        router: createAppRouter({ proxyStore: this.proxyStore }),
      }),
    );

    app.use(errorRequestHandler);

    this.expressServer = app.listen(this.port, () => {
      logger.info(`director gateway running at http://localhost:${this.port}`);
    });

    process.on("SIGINT", async () => {
      logger.info("received SIGINT, cleaning up proxy servers...");
      await this.stop();
      process.exit(0);
    });
  }

  async stop() {
    await this.proxyStore.closeAll();
    await new Promise<void>((resolve) => {
      this.expressServer?.close(() => resolve());
    });
  }
}
