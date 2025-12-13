import express from "express";
import type { Database } from "../../db/database";
import { requireAPIKeyAuth } from "../../middleware/auth";
import type { PlaybookStore } from "../../playbooks/playbook-store";
import { createMcpNextRouter } from "./mcp-next";
import { createSSERouter } from "./sse";
import { createStreamableRouter } from "./streamable";

export function createMCPRouter({
  playbookStore,
}: {
  playbookStore: PlaybookStore;
  database: Database;
}): express.Router {
  const router = express.Router();

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
    createSSERouter({
      playbookStore,
    }),
  );

  router.use(
    createStreamableRouter({
      playbookStore,
    }),
  );

  return router;
}
