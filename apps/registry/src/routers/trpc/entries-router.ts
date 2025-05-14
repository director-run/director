import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import type { DatabaseConnection } from "../../db";
import { EntryStore } from "../../db/entries";

export function createEntriesRouter({ db }: { db: DatabaseConnection }) {
  const entryStore = EntryStore.create(db);
  return t.router({
    getEntries: t.procedure
      .input(
        z.object({
          page: z.number().min(1),
          limit: z.number().min(1),
        }),
      )
      .query(async ({ input }) => {
        const entries = await entryStore.getEntries(input);
        return entries;
      }),
  });
}
