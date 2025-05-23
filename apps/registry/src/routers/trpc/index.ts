import { AppError, ErrorCode } from "@director.run/utilities/error";
import { t } from "@director.run/utilities/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import { env } from "../../config";
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
    createContext: (opts) => {
      return {
        apiKey: opts.req.headers["x-api-key"],
      };
    },
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

export const protectedProcedure = t.procedure.use(function isAuthed(opts) {
  const apiKey = opts.ctx.apiKey;
  if (apiKey !== env.API_KEY) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Unauthorized");
  }
  return opts.next();
});
