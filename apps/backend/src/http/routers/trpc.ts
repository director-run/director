import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import {
  createProxy,
  deleteProxy,
  getProxies,
  getProxy,
  updateProxy,
} from "../../config";
import { proxySchema } from "../../config/schema";
import { PROXY_DB_FILE_PATH } from "../../constants";

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
      return getProxies(PROXY_DB_FILE_PATH);
    } catch (error) {
      console.error(error);
      return [];
    }
  }),
  get: t.procedure.input(z.object({ name: z.string() })).query(({ input }) => {
    return getProxy(input.name, PROXY_DB_FILE_PATH);
  }),
  create: t.procedure
    .input(proxySchema.omit({ id: true }))
    .mutation(({ input }) => {
      return createProxy(input, PROXY_DB_FILE_PATH);
    }),
  update: t.procedure
    .input(
      z.object({
        name: z.string(),
        attributes: proxySchema.partial(),
      }),
    )
    .mutation(({ input }) => {
      return updateProxy(input.name, input.attributes, PROXY_DB_FILE_PATH);
    }),
  delete: t.procedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      return deleteProxy(input.name, PROXY_DB_FILE_PATH);
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
