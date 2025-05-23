import { ErrorCode } from "@director.run/utilities/error";
import { AppError } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { asyncHandler } from "@director.run/utilities/middleware";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import type { ProxyServerStore } from "../proxy-server-store";

const logger = getLogger("mcp/streamable");

export const createStreamableRouter = ({
  proxyStore,
}: {
  proxyStore: ProxyServerStore;
}) => {
  const router = express.Router();
  const transports: Map<string, StreamableHTTPServerTransport> = new Map();
  router.get(
    "/status",
    asyncHandler((req, res) => {
      // iterate over all transports and get the status of each transport
      // console.log("--------------------------------");
      // console.log("--------------------------------");
      // console.log("--------------------------------");

      // console.log("Transports:");
      // for (const sessionId of transports.keys()) {
      //   const transport = transports.get(sessionId);
      //   console.log(sessionId);
      // }
      // console.log("--------------------------------");
      // console.log("--------------------------------");
      // console.log("--------------------------------");

      res.json({
        status: "ok",
        transports: Array.from(transports.keys()),
      });
    }),
  );

  router.use(express.json());
  router.post(
    "/:proxy_id/mcp",
    asyncHandler(async (req, res) => {
      const proxyId = req.params.proxy_id;
      const proxy = await proxyStore.get(proxyId);

      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports.has(sessionId)) {
        // Reuse existing transport
        const existingTransport = transports.get(sessionId);
        if (!existingTransport) {
          throw new AppError(ErrorCode.NOT_FOUND, "Transport not found");
        }
        transport = existingTransport;
      } else if (!sessionId && isInitializeRequest(req.body)) {
        logger.info(`[${proxy.id}] new initialization request`);
        // New initialization request
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => crypto.randomUUID(),
          onsessioninitialized: (sessionId) => {
            // Store the transport by session ID
            transports.set(sessionId, transport);
          },
        });

        // Clean up transport when closed
        transport.onclose = () => {
          logger.info(`[${proxy.id}] transport closed`, {
            proxyId: proxy.id,
            sessionId: transport.sessionId,
          });
          if (transport.sessionId) {
            transports.delete(transport.sessionId);
          }
        };

        req.socket.on("close", () => {
          logger.info(`[${proxy.id}] socket closed'`, {
            proxyId: proxy.id,
            sessionId: transport.sessionId,
          });
        });
        // Connect to the proxy server
        await proxy.connect(transport);
      } else {
        throw new AppError(
          ErrorCode.BAD_REQUEST,
          "No valid session ID provided",
        );
      }

      logger.info({
        message: `[${proxy.id}] '${req.body.method}' called`,
        proxyId: proxy.id,
        sessionId: transport.sessionId,
        method: req.body.method,
        body: req.body,
      });

      // Handle the request
      await transport.handleRequest(req, res, req.body);
    }),
  );

  // Reusable handler for GET and DELETE requests
  const handleSessionRequest = asyncHandler(
    async (req: express.Request, res: express.Response) => {
      const proxyId = req.params.proxy_id;
      const proxy = proxyStore.get(proxyId);
      const sessionId = req.headers["mcp-session-id"] as string | undefined;

      if (!sessionId || !transports.has(sessionId)) {
        throw new AppError(
          ErrorCode.BAD_REQUEST,
          "Invalid or missing session ID",
        );
      }

      const existingTransport = transports.get(sessionId);
      if (!existingTransport) {
        throw new AppError(ErrorCode.NOT_FOUND, "Transport not found");
      }
      const transport = existingTransport;

      logger.info({
        message: `MCP handleSessionRequest`,
        proxyId: proxy.id,
        sessionId: transport.sessionId,
        body: req.body,
      });

      await transport.handleRequest(req, res);
    },
  );

  // Handle GET requests for server-to-client notifications
  router.get("/:proxy_id/mcp", handleSessionRequest);

  // Handle DELETE requests for session termination
  router.delete("/:proxy_id/mcp", handleSessionRequest);

  return router;
};
