import { Server } from "http";
import { createOauthCallbackRouter } from "@director.run/mcp/oauth/oauth-callback-router";
import { isDevelopment } from "@director.run/utilities/env";
import { getLogger } from "@director.run/utilities/logger";
import {
  errorRequestHandler,
  notFoundHandler,
} from "@director.run/utilities/middleware/index";
import { logRequests } from "@director.run/utilities/middleware/index";
import { spaMiddleware } from "@director.run/utilities/middleware/spa";
import { Telemetry } from "@director.run/utilities/telemetry";
import cors from "cors";
import express from "express";
import { Config } from "./config";
import { createSSERouter } from "./routers/sse";
import { createStreamableRouter } from "./routers/streamable";
import { createTRPCExpressMiddleware } from "./routers/trpc";
import { WorkspaceStore } from "./workspaces/workspace-store";

const logger = getLogger("Gateway");

const ALLOWED_ORIGINS = [/^https?:\/\/localhost(:\d+)?$/];

export class Gateway {
  public readonly workspaceStore: WorkspaceStore;
  public readonly port: number;
  private server: Server;
  public readonly config: Config;

  private constructor(attribs: {
    workspaceStore: WorkspaceStore;
    port: number;
    config: Config;
    server: Server;
  }) {
    this.port = attribs.port;
    this.workspaceStore = attribs.workspaceStore;
    this.server = attribs.server;
    this.config = attribs.config;
  }

  public static async start(
    attribs: {
      port: number;
      studioDistPath?: string;
      config: Config;
      telemetry?: Telemetry;
      oauth?:
        | {
            storage: "disk";
            tokenDirectory: string;
          }
        | {
            storage: "memory";
          };
    },
    successCallback?: () => void,
  ) {
    logger.info(`starting director gateway`);

    const workspaceStore = await WorkspaceStore.create({
      config: attribs.config,
      telemetry: attribs.telemetry,
      oauth: attribs.oauth
        ? {
            ...attribs.oauth,
            baseCallbackUrl: `http://localhost:${attribs.port}`,
          }
        : undefined,
    });
    const app = express();

    app.use(
      cors({
        origin: ALLOWED_ORIGINS,
      }),
    );
    app.use(logRequests());
    if (attribs.studioDistPath) {
      logger.trace({
        message: "serving studio assets from",
        distPath: attribs.studioDistPath,
      });
      app.use(
        "/studio",
        spaMiddleware({
          distPath: attribs.studioDistPath,
          config: {
            basePath: "/studio",
          },
        }),
      );
    }
    app.use(
      "/",
      createSSERouter({ workspaceStore, telemetry: attribs.telemetry }),
    );
    app.use(
      "/",
      createStreamableRouter({ workspaceStore, telemetry: attribs.telemetry }),
    );
    app.use(
      "/",
      createOauthCallbackRouter({
        onAuthorizationSuccess: async (factoryId, providerId, code) => {
          await workspaceStore.onAuthorizationSuccess(
            factoryId,
            providerId,
            code,
          );
          return {
            redirectUrl: `http://localhost:${isDevelopment() ? 3000 : attribs.port}/oauth/${factoryId}/${providerId}/callback`,
          };
        },
        onAuthorizationError: (factoryId, providerId, error) => {
          logger.error({
            error,
            message: `failed to authorize ${factoryId} ${providerId}: ${error.message}`,
          });
          return {
            redirectUrl: `http://localhost:${isDevelopment() ? 3000 : attribs.port}/oauth/${factoryId}/${providerId}/callback?error=${JSON.stringify(error)}`,
          };
        },
      }),
    );

    app.use("/trpc", createTRPCExpressMiddleware({ workspaceStore }));
    app.all("*", notFoundHandler);
    app.use(errorRequestHandler);

    attribs.telemetry?.trackEvent("gateway_start");

    const server = app.listen(attribs.port, () => {
      logger.info(`director gateway running on port ${attribs.port}`);
      successCallback?.();
    });

    const gateway = new Gateway({
      port: attribs.port,
      config: attribs.config,
      workspaceStore,
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
    await this.workspaceStore.closeAll();
    await new Promise<void>((resolve) => {
      // Close all existing connections
      // Stop accepting new connections
      this.server.close(() => resolve());
    });
  }
}
