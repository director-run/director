import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import type { Store } from "../../db/store";

export function createEntriesRouter({ store }: { store: Store }) {
  return t.router({
    getEntries: t.procedure
      .input(
        z.object({
          page: z.number().min(1),
          limit: z.number().min(1),
        }),
      )
      .query(({ input }) => store.entries.paginateEntries(input)),
  });
}
