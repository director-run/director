import { sseRouter } from "@director.run/mcp/transport";
import express from "express";
import type { PlaybookStore } from "../playbooks/playbook-store";

export const createSSERouter = ({
  playbookStore,
}: {
  playbookStore: PlaybookStore;
}): express.Router => {
  const router = express.Router();

  router.use(
    "/:playbook_id",
    sseRouter((req) => playbookStore.getByIdOnly(req.params.playbook_id), {
      getMessagePath: (req) => `/${req.params.playbook_id}/message`,
    }),
  );

  return router;
};
