import type { inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "../init";
import { githubRouter } from "./github";
import { healthRouter } from "./health";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  github: githubRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export type RouterOutputs = inferRouterOutputs<AppRouter>;
