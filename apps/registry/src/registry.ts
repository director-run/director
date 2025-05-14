import { Server } from "http";
import { getLogger } from "@director.run/utilities/logger";
import {
  asyncHandler,
  errorRequestHandler,
} from "@director.run/utilities/middleware";
import cors from "cors";
import { count } from "drizzle-orm";
import express from "express";
import { z } from "zod";
import { closeDatabase, db } from "./db";
import { entriesTable } from "./db/schema";

const logger = getLogger("registry/server");

// Pagination schema
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export class Registry {
  public readonly port: number;
  private server: Server;

  private constructor(attribs: {
    port: number;
    server: Server;
  }) {
    this.port = attribs.port;
    this.server = attribs.server;
  }

  public static async start(attribs: {
    port: number;
  }) {
    logger.info(`starting registry...`);

    const app = express();

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
        const [{ value: totalCount }] = await db
          .select({ value: count() })
          .from(entriesTable);

        // Get paginated entries
        const entries = await db
          .select()
          .from(entriesTable)
          .limit(limit)
          .offset(offset);

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

    // Error handling middleware
    app.use(errorRequestHandler);

    const server = app.listen(attribs.port, () => {
      logger.info(`registry running on port ${attribs.port}`);
    });

    const registry = new Registry({
      port: attribs.port,
      server,
    });

    process.on("SIGINT", async () => {
      logger.info("received SIGINT, shutting down registry...");
      await registry.stop();
      process.exit(0);
    });

    return registry;
  }

  async stop() {
    await closeDatabase();
    await new Promise<void>((resolve) => {
      this.server.close(() => resolve());
    });
  }
}
