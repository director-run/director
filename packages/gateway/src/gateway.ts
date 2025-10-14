import { Server } from "node:http";
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
  private studioAssetsPath?: string;
  private baseUrl: string;
  public get port() {
    return this.config.get("server.port") as number;
  }

  private constructor(attribs: {
    workspaceStore: WorkspaceStore;
    config: Config;
    telemetry?: Telemetry;
    studioAssetsPath?: string;
    baseUrl: string;
  }) {
    this.workspaceStore = attribs.workspaceStore;
    this.config = attribs.config;
    this.telemetry = attribs.telemetry;
    this.studioAssetsPath = attribs.studioAssetsPath;
    this.baseUrl = attribs.baseUrl;
    this.app = express();

    this.app.use(
      cors({
        origin: ALLOWED_ORIGINS,
      }),
    );
    this.app.use(logRequests());
    if (this.studioAssetsPath) {
      logger.debug({
        message: "serving studio assets from",
        distPath: this.studioAssetsPath,
      });
      this.app.use(
        "/studio",
        spaMiddleware({
          distPath: this.studioAssetsPath,
          config: {
            basePath: "/studio",
          },
        }),
      );
    } else {
      logger.warn({
        message: "studioAssetsPath not provided, studio will not be available",
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
          if (this.studioAssetsPath) {
            // Redirect to hosted studio callback page
            return {
              redirectUrl: `${this.baseUrl}/studio/oauth/${factoryId}/${providerId}/callback`,
            };
          } else if (isDevelopment()) {
            // redirect to dev studio callback page
            return {
              redirectUrl: `http://localhost:3000/oauth/${factoryId}/${providerId}/callback`,
            };
          }
        },
        onAuthorizationError: (factoryId, providerId, error) => {
          logger.error({
            error,
            message: `failed to authorize ${factoryId} ${providerId}: ${error.message}`,
          });
          if (this.studioAssetsPath) {
            // Redirect to hosted studio callback page
            return {
              redirectUrl: `${this.baseUrl}/studio/oauth/${factoryId}/${providerId}/callback?error=${JSON.stringify(error)}`,
            };
          } else if (isDevelopment()) {
            // redirect to dev studio callback page
            return {
              redirectUrl: `http://localhost:3000/oauth/${factoryId}/${providerId}/callback?error=${JSON.stringify(error)}`,
            };
          }
        },
      }),
    );

    this.app.use(
      "/trpc",
      createTRPCExpressMiddleware({ workspaceStore: this.workspaceStore }),
    );
    this.app.get("/", (_, res, next) => {
      if (this.studioAssetsPath) {
        res.redirect("/studio");
      } else {
        return next();
      }
    });
    this.app.all("*", notFoundHandler);
    this.app.use(errorRequestHandler);
  }

  public static async start(
    attribs: {
      studioAssetsPath?: string;
      config: Config;
      telemetry?: Telemetry;
      baseUrl: string;
    },
    successCallback?: () => void,
  ) {
    logger.info(`starting director gateway`);

    const workspaceStore = await WorkspaceStore.create({
      config: attribs.config,
      telemetry: attribs.telemetry,
      oauth:
        attribs.config.get("oauth.storage") === "disk"
          ? {
              storage: "disk",
              tokenDirectory: attribs.config.get(
                "oauth.tokenDirectory",
              ) as string,
              baseCallbackUrl: attribs.baseUrl,
            }
          : {
              storage: "memory",
              baseCallbackUrl: attribs.baseUrl,
            },
    });

    attribs.telemetry?.trackEvent("gateway_start");

    const gateway = new Gateway({
      config: attribs.config,
      workspaceStore,
      telemetry: attribs.telemetry,
      studioAssetsPath: attribs.studioAssetsPath,
      baseUrl: attribs.baseUrl,
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
      // @ts-ignore
      this.server?.closeAllConnections();
      this.server?.close(() => resolve());
    });
  }
}
