import express from "express";
import type { Database } from "../../db/database";
import { requireAPIKeyAuth } from "../../middleware/auth";
import type { PlaybookStore } from "../../playbooks/playbook-store";
import { createSSERouter } from "./sse";
import { createStreamableRouter } from "./streamable";

export function createMCPRouter({
  playbookStore,
  //   database,
}: {
  playbookStore: PlaybookStore;
  database: Database;
}): express.Router {
  const router = express.Router();

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
