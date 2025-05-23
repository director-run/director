import { AppError, ErrorCode } from "@director.run/utilities/error";
import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import { env } from "../../config";
import type { Store } from "../../db/store";

export function createEntriesRouter({ store }: { store: Store }) {
  return t.router({
    getEntries: t.procedure
      .input(
        z.object({
          pageIndex: z.number().min(0),
          pageSize: z.number().min(1),
        }),
      )
      .query(({ input }) => store.entries.paginateEntries(input)),
    getEntryByName: t.procedure
      .input(z.object({ name: z.string() }))
      .query(({ input }) => store.entries.getEntryByName(input.name)),

    getSecretEntryByName: protectedProcedure
      .input(z.object({ name: z.string() }))
      .query(({ input }) => store.entries.getEntryByName(input.name)),
  });
}

export const protectedProcedure = t.procedure.use(function isAuthed(opts) {
  const apiKey = ""; //opts.ctx.req.headers.get("x-api-key");
  if (apiKey !== env.API_WRITE_KEY) {
    throw new AppError(ErrorCode.UNAUTHORIZED, "Unauthorized");
  }
  return opts.next();
});
