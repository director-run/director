import { actionWithErrorHandler } from "@director.run/utilities/cli";
import { getLogger } from "@director.run/utilities/logger";
import {} from "@director.run/utilities/middleware";
import { Command } from "commander";
import express from "express";
import { z } from "zod";
import { startServer } from "../http/server";

const logger = getLogger("registry/server");

// Pagination schema
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

let server: ReturnType<express.Application["listen"]> | null = null;

export function registerServerCommands(program: Command) {
  program
    .command("server:start")
    .description("Start the server")
    .action(
      actionWithErrorHandler(async () => {
        await startServer();
      }),
    );
}
