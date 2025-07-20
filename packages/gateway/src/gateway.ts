import { Server } from "http";
import { getLogger } from "@director.run/utilities/logger";
import {
  errorRequestHandler,
  notFoundHandler,
} from "@director.run/utilities/middleware";
import { logRequests } from "@director.run/utilities/middleware";
import { Telemetry } from "@director.run/utilities/telemetry";
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

  public static async start(
    attribs: {
      port: number;
      databaseFilePath: string;
      registryURL: string;
      allowedOrigins?: string[];
      telemetry?: Telemetry;
    },
    successCallback?: () => void,
  ) {
    logger.info(`starting director gateway`);

    const db = await Database.connect(attribs.databaseFilePath);
    const telemetry = attribs.telemetry || Telemetry.noTelemetry();
    const proxyStore = await ProxyServerStore.create(db, telemetry);
    const app = express();
    const registryURL = attribs.registryURL;

    app.use(
      cors({
        origin: attribs.allowedOrigins,
      }),
    );
    app.use(logRequests());
    app.use("/", createSSERouter({ proxyStore, telemetry }));
    app.use("/", createStreamableRouter({ proxyStore, telemetry }));
    app.use("/trpc", createTRPCExpressMiddleware({ proxyStore, registryURL }));
    app.all("*", notFoundHandler);
    app.use(errorRequestHandler);

    telemetry.trackEvent("gateway_start");

    const server = app.listen(attribs.port, () => {
      logger.info(`director gateway running on port ${attribs.port}`);
      successCallback?.();
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
      // Close all existing connections
      this.server.closeAllConnections();
      // Stop accepting new connections
      this.server.close(() => resolve());
    });
  }
}
