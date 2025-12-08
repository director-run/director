import express from "express";
import type { Database } from "../../db/database";
import { fakeAPIKeyAuth } from "../../middleware/auth";
import type { PlaybookStore } from "../../playbooks/playbook-store";
import { createStreamableRouter } from "./streamable";

export function createMCPRouter({
  playbookStore,
  database,
}: {
  playbookStore: PlaybookStore;
  database: Database;
}): express.Router {
  const router = express.Router();

  router.use(fakeAPIKeyAuth(database));
  router.use(
    createStreamableRouter({
      playbookStore,
    }),
  );

  return router;
}
