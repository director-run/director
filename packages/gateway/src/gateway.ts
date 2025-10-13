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
  private server?: Server;
  public readonly config: Config;
  private app: express.Express;
  private telemetry?: Telemetry;
  private studioDistPath?: string;

  public get port() {
    return this.config.get("server.port") as number;
  }

  private constructor(attribs: {
    workspaceStore: WorkspaceStore;
    config: Config;
    telemetry?: Telemetry;
    studioDistPath?: string;
  }) {
    this.workspaceStore = attribs.workspaceStore;
    this.config = attribs.config;
    this.telemetry = attribs.telemetry;
    this.studioDistPath = attribs.studioDistPath;
    this.app = express();

    this.app.use(
      cors({
        origin: ALLOWED_ORIGINS,
      }),
    );
    this.app.use(logRequests());
    if (this.studioDistPath) {
      logger.debug({
        message: "serving studio assets from",
        distPath: this.studioDistPath,
      });
      this.app.use(
        "/studio",
        spaMiddleware({
          distPath: this.studioDistPath,
          config: {
            basePath: "/studio",
          },
        }),
      );
    } else {
      logger.warn({
        message: "studioDistPath not provided, studio will not be available",
      });
    }
    this.app.use(
      "/",
      createSSERouter({
        workspaceStore: this.workspaceStore,
        telemetry: this.telemetry,
      }),
    );
    this.app.use(
      "/",
      createStreamableRouter({
        workspaceStore: this.workspaceStore,
        telemetry: this.telemetry,
      }),
    );
    this.app.use(
      "/",
      createOauthCallbackRouter({
        onAuthorizationSuccess: async (factoryId, providerId, code) => {
          await this.workspaceStore.onAuthorizationSuccess(
            factoryId,
            providerId,
            code,
          );
          return {
            redirectUrl: `http://localhost:${isDevelopment() ? 3000 : this.port}/oauth/${factoryId}/${providerId}/callback`,
          };
        },
        onAuthorizationError: (factoryId, providerId, error) => {
          logger.error({
            error,
            message: `failed to authorize ${factoryId} ${providerId}: ${error.message}`,
          });
          return {
            redirectUrl: `http://localhost:${isDevelopment() ? 3000 : this.port}/oauth/${factoryId}/${providerId}/callback?error=${JSON.stringify(error)}`,
          };
        },
      }),
    );

    this.app.use(
      "/trpc",
      createTRPCExpressMiddleware({ workspaceStore: this.workspaceStore }),
    );
    this.app.all("*", notFoundHandler);
    this.app.use(errorRequestHandler);
  }

  public static async start(
    attribs: {
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
            baseCallbackUrl: `http://localhost:${attribs.config.get("server.port") as number}`,
          }
        : undefined,
    });

    attribs.telemetry?.trackEvent("gateway_start");

    const gateway = new Gateway({
      config: attribs.config,
      workspaceStore,
      telemetry: attribs.telemetry,
      studioDistPath: attribs.studioDistPath,
    });

    await gateway.start(successCallback);

    process.on("SIGINT", async () => {
      logger.info("received SIGINT, cleaning up proxy servers...");
      await gateway.stop();
      process.exit(0);
    });

    return gateway;
  }

  private async start(successCallback?: () => void) {
    this.server = this.app.listen(this.port, () => {
      logger.info(`director gateway running on port ${this.port}`);
      successCallback?.();
    });
  }

  async stop() {
    await this.workspaceStore.closeAll();
    await new Promise<void>((resolve) => {
      this.server?.close(() => resolve());
    });
  }
}
