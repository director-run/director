import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import { getEntries } from "../../db/entries";

export function createEntriesRouter() {
  return t.router({
    getEntries: t.procedure
      .input(
        z.object({
          page: z.number().min(1),
          limit: z.number().min(1),
        }),
      )
      .query(async ({ input }) => {
        const entries = await getEntries(input);
        return entries;
      }),
  });
}
