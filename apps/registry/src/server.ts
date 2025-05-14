import { getLogger } from "@director.run/utilities/logger";
import {
  asyncHandler,
  errorRequestHandler,
} from "@director.run/utilities/middleware";
import cors from "cors";
import { count } from "drizzle-orm";
import express from "express";
import { z } from "zod";
import { db } from "./db";
import { entriesTable } from "./db/schema";

const logger = getLogger("registry/server");

// Pagination schema
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

let server: ReturnType<express.Application["listen"]> | null = null;

export function startServer(params: { port: number }) {
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

  // Start the server
  server = app.listen(params.port, () => {
    logger.info(`Registry server running at http://localhost:${params.port}`);
  });

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    logger.info("Received SIGINT, shutting down server...");
    server?.close(() => {
      process.exit(0);
    });
  });

  return server;
}
