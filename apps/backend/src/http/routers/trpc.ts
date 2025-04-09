import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { PROXY_DB_FILE_PATH } from "../../constants";
import {
  addProxyConfigEntry,
  deleteProxyConfigEntry,
  getProxyConfigEntries,
  getProxyConfigEntry,
  updateProxyConfigEntry,
} from "../../services/db";
import { proxySchema } from "../../services/db/schema";

export const createTRPCContext = async (_opts: { headers: Headers }) => {
  return {};
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

const createTRPCRouter = t.router;

const storeRouter = createTRPCRouter({
  getAll: t.procedure.query(() => {
    try {
      return getProxyConfigEntries(PROXY_DB_FILE_PATH);
    } catch (error) {
      console.error(error);
      return [];
    }
  }),
  get: t.procedure.input(z.object({ name: z.string() })).query(({ input }) => {
    return getProxyConfigEntry(input.name, PROXY_DB_FILE_PATH);
  }),
  create: t.procedure
    .input(proxySchema.omit({ id: true }))
    .mutation(({ input }) => {
      return addProxyConfigEntry(input, PROXY_DB_FILE_PATH);
    }),
  update: t.procedure
    .input(
      z.object({
        name: z.string(),
        attributes: proxySchema.partial(),
      }),
    )
    .mutation(({ input }) => {
      return updateProxyConfigEntry(
        input.name,
        input.attributes,
        PROXY_DB_FILE_PATH,
      );
    }),
  delete: t.procedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      return deleteProxyConfigEntry(input.name, PROXY_DB_FILE_PATH);
    }),
});

export const appRouter = createTRPCRouter({
  store: storeRouter,
  greeting: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `Hello ${input.name}` as const;
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
