import { streamableRouter } from "@director.run/mcp/transport";
import express from "express";
import type { NextFunction } from "express";
import type { Database } from "../db/database";
import {
  type AuthenticatedRequest,
  // requireAPIKeyAuth,
} from "../middleware/auth";
import type { PlaybookStore } from "../playbooks/playbook-store";

export function createMCPRouter({
  playbookStore,
  database,
}: {
  playbookStore: PlaybookStore;
  database: Database;
}): express.Router {
  const router = express.Router();

  // Apply authentication middleware (supports both sessions and API keys)
  router.use("/:playbook_id", fakeAPIKeyAuth(database));

  // SSE transport (legacy)
  // router.use(
  //   "/:playbook_id",
  //   sseRouter(
  //     (req) => {
  //       const authReq = req as AuthenticatedRequest;
  //       return playbookStore.getForUser(req.params.playbook_id, authReq.userId);
  //     },
  //     {
  //       getMessagePath: (req) => `/playbooks/${req.params.playbook_id}/message`,
  //     },
  //   ),
  // );

  // Streamable HTTP transport
  router.use(
    "/:playbook_id",
    streamableRouter((req) => {
      const authReq = req as AuthenticatedRequest;
      return playbookStore.getForUser(req.params.playbook_id, authReq.userId);
    }),
  );

  return router;
}

function fakeAPIKeyAuth(database: Database): express.RequestHandler {
  return async (
    req: express.Request & { userId?: string },
    _: express.Response,
    next: NextFunction,
  ) => {
    const user = await database.getUserByEmail("user@director.run");
    if (!user) {
      throw new Error("User not found");
    }
    req.userId = user.id;
    next(null);
  };
}
