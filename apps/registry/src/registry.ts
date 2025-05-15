import { Server } from "http";
import { getLogger } from "@director.run/utilities/logger";
import {
  asyncHandler,
  errorRequestHandler,
} from "@director.run/utilities/middleware";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { type Store, makeStore } from "./db/store";
import { createTRPCExpressMiddleware } from "./routers/trpc";
// import { entriesTable } from "./db/schema";

const logger = getLogger("registry/server");

// Pagination schema
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export class Registry {
  public readonly port: number;
  private server: Server;
  public readonly store: Store;

  private constructor(attribs: {
    port: number;
    server: Server;
    store: Store;
  }) {
    this.port = attribs.port;
    this.server = attribs.server;
    this.store = attribs.store;
  }

  public static async start(attribs: {
    port: number;
    connectionString?: string;
  }) {
    logger.info(`starting registry...`);

    const app = express();
    const store = makeStore();

    app.use(cors());
    app.use(express.json());

    // Get all entries endpoint with pagination
    app.get(
      "/api/v1/entries",
      asyncHandler(async (req, res) => {
        // Parse and validate pagination parameters
        const { page, limit } = paginationSchema.parse(req.query);

        // Calculate offset
        const offset = (page - 1) * limit;

        // Get total count for pagination metadata
        const totalCount = await store.entries.countEntries();
        // Get paginated entries
        const { entries } = await store.entries.paginateEntries({
          pageIndex: page,
          pageSize: limit,
        });

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);

        // Return paginated response
        res.json({
          data: entries,
          pagination: {
            page,
            limit,
            totalItems: totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        });
      }),
    );

    app.use("/trpc", createTRPCExpressMiddleware({ store }));
    app.use(errorRequestHandler);

    const server = app.listen(attribs.port, () => {
      logger.info(`registry running on port ${attribs.port}`);
    });

    const registry = new Registry({
      port: attribs.port,
      server,
      store,
    });

    process.on("SIGINT", async () => {
      logger.info("received SIGINT, shutting down registry...");
      await registry.stop();
      process.exit(0);
    });

    return registry;
  }

  async stop() {
    await this.store.close();
    await new Promise<void>((resolve) => {
      this.server.close(() => resolve());
    });
  }
}
