import { streamableRouter } from "@director.run/mcp/transport";
import express from "express";
import { createAuthMiddleware } from "../middleware/auth";
import type { PlaybookStore } from "../playbooks/playbook-store";

export const createStreamableRouter = ({
  playbookStore,
}: {
  playbookStore: PlaybookStore;
}): express.Router => {
  const router = express.Router();

  // Apply authentication middleware (supports both sessions and API keys)
  router.use("/:playbook_id", createAuthMiddleware());

  router.use(
    "/:playbook_id",
    streamableRouter((req) => {
      const userId = req.userId;
      if (!userId) {
        throw new Error("Authentication required");
      }
      return playbookStore.getForUser(req.params.playbook_id, userId);
    }),
  );

  return router;
};
