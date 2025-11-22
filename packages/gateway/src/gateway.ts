import { Server } from "node:http";
import { createOauthCallbackRouter } from "@director.run/mcp/oauth/oauth-callback-router";
import type { OAuthProviderFactoryParams } from "@director.run/mcp/oauth/oauth-provider-factory";
import { isDevelopment } from "@director.run/utilities/env";
import { getLogger } from "@director.run/utilities/logger";
import {
  errorRequestHandler,
  notFoundHandler,
} from "@director.run/utilities/middleware/index";
import { logRequests } from "@director.run/utilities/middleware/index";
import { spaMiddleware } from "@director.run/utilities/middleware/spa";
import { Telemetry } from "@director.run/utilities/telemetry";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./auth";
import { ClientStore } from "./client-store";
import type { PlaybookDbStore } from "./db/playbooks";
import { ALLOWED_ORIGINS } from "./env";
import { PlaybookStore } from "./playbooks/playbook-store";
import { createSSERouter } from "./routers/sse";
import { createStreamableRouter } from "./routers/streamable";
import { createTRPCExpressMiddleware } from "./routers/trpc";

const logger = getLogger("Gateway");

export class Gateway {
  public readonly playbookStore: PlaybookStore;
  private server?: Server;
  public readonly dbStore: PlaybookDbStore;
  private app: express.Express;
  private telemetry?: Telemetry;
  private studioAssetsPath?: string;
  private baseUrl: string;
  public readonly port: number;
  public readonly clientStore: ClientStore;

  private constructor(attribs: {
    playbookStore: PlaybookStore;
    dbStore: PlaybookDbStore;
    telemetry?: Telemetry;
    studioAssetsPath?: string;
    baseUrl: string;
    clientStore: ClientStore;
    port: number;
  }) {
    this.playbookStore = attribs.playbookStore;
    this.dbStore = attribs.dbStore;
    this.telemetry = attribs.telemetry;
    this.studioAssetsPath = attribs.studioAssetsPath;
    this.baseUrl = attribs.baseUrl;
    this.clientStore = attribs.clientStore;
    this.port = attribs.port;

    this.app = express();

    this.app.use(
      cors({
        origin: ALLOWED_ORIGINS,
        credentials: true,
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
        playbookStore: this.playbookStore,
        telemetry: this.telemetry,
      }),
    );
    this.app.use(
      "/",
      createStreamableRouter({
        playbookStore: this.playbookStore,
        telemetry: this.telemetry,
      }),
    );
    this.app.use(
      "/",
      createOauthCallbackRouter({
        onAuthorizationSuccess: async (factoryId, providerId, code, userId) => {
          await this.playbookStore.onAuthorizationSuccess(
            factoryId,
            providerId,
            code,
            userId,
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

    this.app.all("/api/auth/*", toNodeHandler(auth));

    this.app.use(
      "/trpc",
      createTRPCExpressMiddleware({
        playbookStore: this.playbookStore,
        clientStore: this.clientStore,
      }),
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
      dbStore: PlaybookDbStore;
      telemetry?: Telemetry;
      baseUrl: string;
      port: number;
      oauth: OAuthProviderFactoryParams;
    },
    successCallback?: () => void,
  ) {
    logger.info(`starting director gateway`);
    const clientStore = new ClientStore();
    const playbookStore = await PlaybookStore.create({
      dbStore: attribs.dbStore,
      telemetry: attribs.telemetry,
      oauth: attribs.oauth,
    });

    attribs.telemetry?.trackEvent("gateway_start");

    const gateway = new Gateway({
      dbStore: attribs.dbStore,
      playbookStore,
      telemetry: attribs.telemetry,
      studioAssetsPath: attribs.studioAssetsPath,
      baseUrl: attribs.baseUrl,
      clientStore,
      port: attribs.port,
    });

    await gateway.start(successCallback);

    process.on("SIGINT", async () => {
      logger.info("received SIGINT, cleaning up playbooks...");
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
    await this.playbookStore.closeAll();
    await new Promise<void>((resolve) => {
      // TODO: fix this -> for some reason type check in CI fails here
      // @ts-ignore
      this.server?.closeAllConnections();
      this.server?.close(() => resolve());
    });
  }
}
