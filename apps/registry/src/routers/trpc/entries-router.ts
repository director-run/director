import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import { protectedProcedure } from ".";
import type { Store } from "../../db/store";
import { enrichEntries } from "../../enrichment/enrich";
import { fetchRaycastRegistry } from "../../importers/raycast";
import { getSeedEntries } from "../../importers/seed";

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

    purge: protectedProcedure.input(z.object({})).mutation(async () => {
      await store.entries.deleteAllEntries();
    }),

    updateEntry: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          isConnectable: z.boolean().optional(),
          lastConnectionAttemptedAt: z.date().optional(),
          lastConnectionError: z.string().optional(),
          tools: z
            .array(
              z.object({
                name: z.string(),
                description: z.string(),
                inputSchema: z.unknown(),
              }),
            )
            .optional(),
        }),
      )
      .mutation(async ({ input }) => {
        await store.entries.updateEntry(input.id, {
          isConnectable: input.isConnectable,
          lastConnectionAttemptedAt: input.lastConnectionAttemptedAt,
          lastConnectionError: input.lastConnectionError,
          tools: input.tools,
        });
      }),

    populate: protectedProcedure.input(z.object({})).mutation(async () => {
      await store.entries.deleteAllEntries();
      await store.entries.addEntries(await fetchRaycastRegistry());
      await store.entries.addEntries(getSeedEntries());
    }),

    enrich: protectedProcedure.input(z.object({})).mutation(async () => {
      await enrichEntries(store);
    }),

    stats: protectedProcedure.input(z.object({})).query(async () => {
      return await store.entries.getStatistics();
    }),
  });
}
