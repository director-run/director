import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";

import {
  createProxy,
  deleteProxy,
  getAllProxies,
  getProxy,
  updateProxy,
} from "../../services/store";

export const createTRPCContext = async (_opts: { headers: Headers }) => {
  return {};
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

const createTRPCRouter = t.router;

const storeRouter = createTRPCRouter({
  getAll: t.procedure.query(() => {
    return getAllProxies();
  }),
  get: t.procedure.input(z.object({ name: z.string() })).query(({ input }) => {
    return getProxy(input.name);
  }),
  create: t.procedure
    .input(
      z.object({
        name: z.string(),
        servers: z.array(
          z.object({
            name: z.string(),
            transport: z.union([
              z.object({ command: z.string(), args: z.array(z.string()) }),
              z.object({ type: z.literal("sse"), url: z.string() }),
            ]),
          }),
        ),
      }),
    )
    .mutation(({ input }) => {
      return createProxy(input);
    }),
  update: t.procedure
    .input(
      z.object({
        name: z.string(),
        attributes: z.object({
          name: z.string().optional(),
          servers: z
            .array(
              z.object({
                name: z.string(),
                transport: z.union([
                  z.object({ command: z.string(), args: z.array(z.string()) }),
                  z.object({ type: z.literal("sse"), url: z.string() }),
                ]),
              }),
            )
            .optional(),
        }),
      }),
    )
    .mutation(({ input }) => {
      return updateProxy(input.name, input.attributes);
    }),
  delete: t.procedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      return deleteProxy(input.name);
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
