import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { db } from "../../services/db";
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
      return db.listProxies();
    } catch (error) {
      console.error(error);
      return [];
    }
  }),
  get: t.procedure
    .input(z.object({ proxyId: z.string() }))
    .query(({ input }) => {
      return db.getProxy(input.proxyId);
    }),
  create: t.procedure
    .input(proxySchema.omit({ id: true }))
    .mutation(({ input }) => {
      return db.addProxy(input);
    }),
  update: t.procedure
    .input(
      z.object({
        proxyId: z.string(),
        attributes: proxySchema.partial(),
      }),
    )
    .mutation(({ input }) => {
      return db.updateProxy(input.proxyId, input.attributes);
    }),
  delete: t.procedure
    .input(z.object({ proxyId: z.string() }))
    .mutation(({ input }) => {
      return db.deleteProxy(input.proxyId);
    }),
});

export const appRouter = createTRPCRouter({
  store: storeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
