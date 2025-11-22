import { streamableRouter } from "@director.run/mcp/transport";
import express from "express";
import type { PlaybookStore } from "../playbooks/playbook-store";

export const createStreamableRouter = ({
  playbookStore,
}: {
  playbookStore: PlaybookStore;
}): express.Router => {
  const router = express.Router();

  router.use(
    "/:playbook_id",
    streamableRouter((req) =>
      playbookStore.getByIdOnly(req.params.playbook_id),
    ),
  );

  return router;
};
