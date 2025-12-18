import express from "express";
import type { Database } from "../../db/database";
import { requireAPIKeyAuth } from "../../middleware/auth";
import type { PlaybookStore } from "../../playbooks/playbook-store";
import { createMcpNextRouter } from "./mcp-next";
import { createStreamableRouter } from "./streamable";

export function createMCPRouter({
  playbookStore,
}: {
  playbookStore: PlaybookStore;
  database: Database;
}): express.Router {
  const router = express.Router();

  // Parse JSON body once at the parent level to avoid "stream is not readable"
  // errors when multiple sub-routers try to parse the same body
  router.use(express.json());

  // OAuth-protected MCP endpoint (mcp-next) - has its own authentication
  // Must be mounted before the API key auth middleware
  router.use(
    createMcpNextRouter({
      playbookStore,
    }),
  );

  // API key authentication for legacy endpoints
  router.use(requireAPIKeyAuth());

  router.use(
    createStreamableRouter({
      playbookStore,
    }),
  );

  return router;
}
