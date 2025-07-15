import { createTRPCRouter } from "@/trpc/init";
import { githubRouter } from "@/trpc/routers/github-router";
import type { inferRouterOutputs } from "@trpc/server";

export const appRouter = createTRPCRouter({
  github: githubRouter,
});

export type AppRouter = typeof appRouter;

export type RouterOutputs = inferRouterOutputs<AppRouter>;
