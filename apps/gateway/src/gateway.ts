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
import { joinURL } from "@director.run/utilities/url";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./auth";
import type { Database } from "./db/database";
import { env } from "./env";
import { PlaybookStore } from "./playbooks/playbook-store";
import { createMCPRouter } from "./routers/mcp/mcp";
import { createTRPCExpressMiddleware } from "./routers/trpc";

const logger = getLogger("Gateway");

export class Gateway {
  public readonly playbookStore: PlaybookStore;
  private server?: Server;
  public readonly database: Database;
  private app: express.Express;
  private studioAssetsPath?: string;
  private baseUrl: string;
  public readonly port: number;

  private constructor(attribs: {
    playbookStore: PlaybookStore;
    database: Database;
    telemetry?: Telemetry;
    studioAssetsPath?: string;
    baseUrl: string;
    port: number;
  }) {
    this.playbookStore = attribs.playbookStore;
    this.database = attribs.database;
    this.studioAssetsPath = attribs.studioAssetsPath;
    this.baseUrl = attribs.baseUrl;
    this.port = attribs.port;

    this.app = express();

    this.app.use(
      cors({
        origin: [env.BASE_URL, ...env.ALLOWED_ORIGINS],
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
            gatewayUrl: this.baseUrl,
            registryUrl: env.REGISTRY_URL,
          },
        }),
      );

      this.app.get("/", (_, res) => {
        res.redirect("/studio");
      });
    } else {
      logger.warn({
        message: "studioAssetsPath not provided, studio will not be available",
      });
    }

    this.app.use(
      "/playbooks",
      createMCPRouter({
        playbookStore: this.playbookStore,
        database: this.database,
      }),
    );

    this.app.use(
      "/",
      createOauthCallbackRouter({
        getSession: async (req) => {
          const session = await auth.api.getSession({
            headers: req.headers as Record<string, string>,
          });
          if (!session) {
            return null;
          }
          return { userId: session.user.id };
        },
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
              redirectUrl: joinURL(
                this.baseUrl,
                `studio/oauth/${factoryId}/${providerId}/callback`,
              ),
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
          // Only expose the error message to the client, not stack traces or internal details
          const safeErrorMessage = encodeURIComponent(error.message);
          if (this.studioAssetsPath) {
            // Redirect to hosted studio callback page
            return {
              redirectUrl: joinURL(
                this.baseUrl,
                `studio/oauth/${factoryId}/${providerId}/callback?error=${safeErrorMessage}`,
              ),
            };
          } else if (isDevelopment()) {
            // redirect to dev studio callback page
            return {
              redirectUrl: `http://localhost:3000/oauth/${factoryId}/${providerId}/callback?error=${safeErrorMessage}`,
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
        database: this.database,
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
      database: Database;
      telemetry?: Telemetry;
      baseUrl: string;
      port: number;
    },
    successCallback?: () => void,
  ) {
    logger.info(`starting director gateway`);
    const playbookStore = await PlaybookStore.create({
      database: attribs.database,
      telemetry: attribs.telemetry,
      baseCallbackUrl: attribs.baseUrl,
    });

    attribs.telemetry?.trackEvent("gateway_start");

    const gateway = new Gateway({
      database: attribs.database,
      playbookStore,
      telemetry: attribs.telemetry,
      studioAssetsPath: attribs.studioAssetsPath,
      baseUrl: attribs.baseUrl,
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
