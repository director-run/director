import { t } from "@director.run/utilities/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createEntriesRouter } from "./entries-router";

export function createAppRouter() {
  return t.router({
    entries: createEntriesRouter(),
  });
}

export function createTRPCExpressMiddleware() {
  return trpcExpress.createExpressMiddleware({
    router: createAppRouter(),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
