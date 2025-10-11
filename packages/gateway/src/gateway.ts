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

export class Gateway {
  public readonly workspaceStore: WorkspaceStore;
  public readonly port: number;
  private server: Server;
  public readonly db: Config;

  private constructor(attribs: {
    workspaceStore: WorkspaceStore;
    port: number;
    config: Config;
    server: Server;
  }) {
    this.port = attribs.port;
    this.workspaceStore = attribs.workspaceStore;
    this.server = attribs.server;
    this.db = attribs.config;
  }

  public static async start(
    attribs: {
      port: number;
      studioDistPath?: string;
      config: Config;
      registryURL: string;
      allowedOrigins?: (string | RegExp)[];
      telemetry?: {
        enabled: boolean;
        writeKey: string;
        traits: Record<string, string>;
      };
      headers?: Record<string, string>;
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

    const telemetry = attribs.telemetry
      ? new Telemetry({
          writeKey: attribs.telemetry.writeKey,
          enabled: attribs.telemetry.enabled,
          traits: attribs.telemetry.traits,
        })
      : Telemetry.noTelemetry();

    const workspaceStore = await WorkspaceStore.create({
      config: attribs.config,
      telemetry,
      oauth: attribs.oauth
        ? {
            ...attribs.oauth,
            baseCallbackUrl: `http://localhost:${attribs.port}`,
          }
        : undefined,
    });
    const app = express();
    const registryURL = attribs.registryURL;

    if (attribs.headers) {
      app.use((_req, res, next) => {
        Object.entries(attribs.headers || {}).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        next();
      });
    }

    app.use(
      cors({
        origin: attribs.allowedOrigins,
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
    app.use("/", createSSERouter({ workspaceStore, telemetry }));
    app.use("/", createStreamableRouter({ workspaceStore, telemetry }));
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
          logger.error(
            `failed to authorize ${factoryId} ${providerId}: ${error.message}`,
            error,
          );
          return {
            redirectUrl: `http://localhost:${isDevelopment() ? 3000 : attribs.port}/oauth/${factoryId}/${providerId}/callback?error=${JSON.stringify(error)}`,
          };
        },
      }),
    );
    // TODO: add a router to handle the incoming oauth tokens
    // onTokenReceived((token) => OauthBroker.registerToken(token))
    app.use(
      "/trpc",
      createTRPCExpressMiddleware({ workspaceStore, registryURL }),
    );
    app.all("*", notFoundHandler);
    app.use(errorRequestHandler);

    telemetry.trackEvent("gateway_start");

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
      this.server.closeAllConnections();
      // Stop accepting new connections
      this.server.close(() => resolve());
    });
  }
}
