import { Server } from "node:http";
import { isDevelopment } from "@director.run/utilities/env";
import { getLogger } from "@director.run/utilities/logger";
import {
  errorRequestHandler,
  notFoundHandler,
} from "@director.run/utilities/middleware/index";
import { logRequests } from "@director.run/utilities/middleware/index";
import { Telemetry } from "@director.run/utilities/telemetry";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./auth";
import type { Database } from "./db/database";
import { env } from "./env";
import { PlaybookStore } from "./playbooks/playbook-store";
import { createMCPRouter } from "./routers/mcp/mcp";
import { createOauthClientRouter } from "./routers/oauth-client-callback";
import { createStudioRouter } from "./routers/studio";
import { createTRPCExpressMiddleware } from "./routers/trpc";

const logger = getLogger("Gateway");

export class Gateway {
  public readonly playbookStore: PlaybookStore;
  private server?: Server;
  public readonly database: Database;
  private app: express.Express;
  private studioAssetsPath?: string;
  public readonly port: number;

  private constructor(attribs: {
    playbookStore: PlaybookStore;
    database: Database;
    telemetry?: Telemetry;
    studioAssetsPath?: string;
    port: number;
  }) {
    this.playbookStore = attribs.playbookStore;
    this.database = attribs.database;
    this.studioAssetsPath = attribs.studioAssetsPath;
    this.port = attribs.port;

    this.app = express();

    this.app.use(
      cors({
        origin: [env.BASE_URL, ...env.ALLOWED_ORIGINS],
        credentials: true,
      }),
    );

    this.app.use(logRequests());
    this.app.use(
      "/",
      createStudioRouter({ assetsPath: this.studioAssetsPath }),
    );

    this.app.use(
      "/playbooks",
      createMCPRouter({
        playbookStore: this.playbookStore,
        database: this.database,
      }),
    );

    this.app.use(
      "/",
      createOauthClientRouter({ playbookStore: this.playbookStore }),
    );

    // SECURITY: Force consent screen for MCP OAuth authorize requests
    // Without this, better-auth skips consent for already-logged-in users
    // when clients don't include prompt=consent in their request
    this.app.get("/api/auth/mcp/authorize", (req, res, next) => {
      // If prompt is not set to consent, redirect with prompt=consent added
      if (req.query.prompt !== "consent") {
        const url = new URL(
          req.originalUrl,
          `${req.protocol}://${req.get("host")}`,
        );
        url.searchParams.set("prompt", "consent");
        return res.redirect(url.toString());
      }
      next();
    });

    this.app.all("/api/auth/*", toNodeHandler(auth));

    //
    // MCP Oauth authentication for clients
    //
    // Proxy well-known OAuth endpoints from root to better-auth paths
    // MCP clients look for these at /.well-known/ per RFC 9728
    this.app.get("/.well-known/oauth-protected-resource", (_req, res) => {
      res.redirect(307, "/api/auth/.well-known/oauth-protected-resource");
    });
    this.app.get("/.well-known/oauth-authorization-server", (_req, res) => {
      res.redirect(307, "/api/auth/.well-known/oauth-authorization-server");
    });

    // Redirect /connect to Studio's connect page
    // This is the loginPage configured in better-auth's MCP plugin
    this.app.get("/connect", (req, res) => {
      // Preserve all query params (OAuth params)
      const queryString = req.url.includes("?")
        ? req.url.substring(req.url.indexOf("?"))
        : "";

      if (this.studioAssetsPath) {
        // Production: redirect to hosted studio
        res.redirect(`/studio/connect${queryString}`);
      } else if (isDevelopment()) {
        // Development: redirect to dev studio server
        res.redirect(`http://localhost:3000/connect${queryString}`);
      } else {
        res.status(404).send("Studio not available");
      }
    });

    this.app.use(
      "/trpc",
      createTRPCExpressMiddleware({
        playbookStore: this.playbookStore,
        database: this.database,
      }),
    );

    this.app.all("*", notFoundHandler);
    this.app.use(errorRequestHandler);
  }

  public static async start(
    attribs: {
      studioAssetsPath?: string;
      database: Database;
      telemetry?: Telemetry;
      port: number;
    },
    successCallback?: () => void,
  ) {
    logger.info(`starting director gateway`);
    const playbookStore = await PlaybookStore.create({
      database: attribs.database,
      telemetry: attribs.telemetry,
      baseCallbackUrl: env.BASE_URL,
    });

    attribs.telemetry?.trackEvent("gateway_start");

    const gateway = new Gateway({
      database: attribs.database,
      playbookStore,
      telemetry: attribs.telemetry,
      studioAssetsPath: attribs.studioAssetsPath,
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
