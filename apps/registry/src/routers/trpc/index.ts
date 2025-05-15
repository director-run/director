import { t } from "@director.run/utilities/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import type { Store } from "../../db/store";
import { createEntriesRouter } from "./entries-router";

export function createAppRouter({ store }: { store: Store }) {
  return t.router({
    entries: createEntriesRouter({ store }),
  });
}

export function createTRPCExpressMiddleware({ store }: { store: Store }) {
  return trpcExpress.createExpressMiddleware({
    router: createAppRouter({ store }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
