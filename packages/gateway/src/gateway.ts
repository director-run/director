import { Server } from "http";
import { createOauthCallbackRouter } from "@director.run/mcp/oauth/oauth-callback-router";
import { OAuthHandler } from "@director.run/mcp/oauth/oauth-provider-factory";
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
import { Config, YAMLConfig } from "./config";
import { createSSERouter } from "./routers/sse";
import { createStreamableRouter } from "./routers/streamable";
import { createTRPCExpressMiddleware } from "./routers/trpc";
import { WorkspaceStore } from "./workspaces/workspace-store";

const logger = getLogger("Gateway");

export class Gateway {
  public readonly proxyStore: WorkspaceStore;
  public readonly port: number;
  private server: Server;
  public readonly db: Config;

  private constructor(attribs: {
    proxyStore: WorkspaceStore;
    port: number;
    db: Config;
    server: Server;
  }) {
    this.port = attribs.port;
    this.proxyStore = attribs.proxyStore;
    this.server = attribs.server;
    this.db = attribs.db;
  }

  public static async start(
    attribs: {
      port: number;
      studioDistPath?: string;
      configuration: {
        type: "yaml";
        filePath: string;
      };
      registryURL: string;
      allowedOrigins?: string[];
      telemetry?: {
        enabled: boolean;
        writeKey: string;
        traits: Record<string, string>;
      };
      headers?: Record<string, string>;
      oauth?:
        | {
            enabled: boolean;
            storage: "disk";
            tokenDirectory: string;
          }
        | {
            enabled: boolean;
            storage: "memory";
          };
    },
    successCallback?: () => void,
  ) {
    logger.info(`starting director gateway`);

    const db = await YAMLConfig.connect(attribs.configuration.filePath);
    const telemetry = attribs.telemetry
      ? new Telemetry({
          writeKey: attribs.telemetry.writeKey,
          enabled: attribs.telemetry.enabled,
          traits: attribs.telemetry.traits,
        })
      : Telemetry.noTelemetry();

    let oAuthHandler: OAuthHandler | undefined;

    if (attribs.oauth && attribs.oauth.enabled) {
      if (attribs.oauth.storage === "disk") {
        oAuthHandler = OAuthHandler.createDiskBackedHandler({
          directory: attribs.oauth.tokenDirectory,
          baseCallbackUrl: `http://localhost:${attribs.port}`,
        });
      } else if (attribs.oauth.storage === "memory") {
        oAuthHandler = OAuthHandler.createMemoryBackedHandler({
          baseCallbackUrl: `http://localhost:${attribs.port}`,
        });
      }
    }

    const proxyStore = await WorkspaceStore.create({
      config: db,
      telemetry,
      oAuthHandler,
    });
    const app = express();
    const registryURL = attribs.registryURL;

    if (attribs.headers) {
      app.use((req, res, next) => {
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
      logger.info({
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
    app.use("/", createSSERouter({ proxyStore, telemetry }));
    app.use("/", createStreamableRouter({ proxyStore, telemetry }));
    app.use(
      "/",
      createOauthCallbackRouter({
        onAuthorizationSuccess: (serverUrl, code) => {
          proxyStore.onAuthorizationSuccess(serverUrl, code);
        },
        onAuthorizationError: (serverUrl, error) => {
          logger.error(
            `failed to authorize ${serverUrl}: ${error.message}`,
            error,
          );
        },
      }),
    );
    // TODO: add a router to handle the incoming oauth tokens
    // onTokenReceived((token) => OauthBroker.registerToken(token))
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
