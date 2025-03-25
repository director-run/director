import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";

export const createTRPCContext = async (_opts: { headers: Headers }) => {
  return {};
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

export const healthRouter = createTRPCRouter({
  ping: t.procedure.query(() => {
    return { pong: true, ok: true };
  }),
});

export const appRouter = createTRPCRouter({
  health: healthRouter,
  greeting: t.procedure.input(z.object({ name: z.string() })).query(({ input }) => {
    return `Hello ${input.name}` as const;
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
