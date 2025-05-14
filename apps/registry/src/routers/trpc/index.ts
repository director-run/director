import { t } from "@director.run/utilities/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import type { DatabaseConnection } from "../../db";
import { createEntriesRouter } from "./entries-router";

export function createAppRouter({ db }: { db: DatabaseConnection }) {
  return t.router({
    entries: createEntriesRouter({ db }),
  });
}

export function createTRPCExpressMiddleware({
  db,
}: { db: DatabaseConnection }) {
  return trpcExpress.createExpressMiddleware({
    router: createAppRouter({ db }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
