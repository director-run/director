import { Server } from "http";
import { getLogger } from "@director.run/utilities/logger";
import { errorRequestHandler } from "@director.run/utilities/middleware";
import cors from "cors";
import express from "express";
import { Database } from "./db";
import { ProxyServerStore } from "./proxy-server-store";
import { createMCPRouter } from "./routers/mcp";
import { createTRPCExpressMiddleware } from "./routers/trpc";

const logger = getLogger("startService");

export const startService = async (attribs: {
  port: number;
  databaseFilePath: string;
}) => {
  const gateway = await Gateway.start(attribs);
  return gateway;
};

export class Gateway {
  public readonly proxyStore: ProxyServerStore;
  public readonly port: number;
  private server: Server;

  private constructor(attribs: {
    proxyStore: ProxyServerStore;
    port: number;
    db: Database;
    server: Server;
  }) {
    this.port = attribs.port;
    this.proxyStore = attribs.proxyStore;
    this.server = attribs.server;
  }

  public static async start(attribs: {
    port: number;
    databaseFilePath: string;
  }) {
    logger.info(`starting director...`);

    const db = await Database.connect(attribs.databaseFilePath);
    const proxyStore = await ProxyServerStore.create(db);
    const app = express();

    app.use(cors());
    app.use("/", createMCPRouter({ proxyStore }));
    app.use("/trpc", createTRPCExpressMiddleware({ proxyStore }));
    app.use(errorRequestHandler);

    const server = app.listen(attribs.port, () => {
      logger.info(`director gateway running on port ${attribs.port}`);
    });

    const gateway = new Gateway({
      port: attribs.port,
      db,
      proxyStore,
      server,
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
