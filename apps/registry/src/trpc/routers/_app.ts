import type { inferRouterOutputs } from "@trpc/server";

import { createTRPCRouter } from "../init";
import { entriesRouter } from "./entries-router";
import { githubRouter } from "./github-router";

export const appRouter = createTRPCRouter({
  github: githubRouter,
  entries: entriesRouter,
});

export type AppRouter = typeof appRouter;

export type RouterOutputs = inferRouterOutputs<AppRouter>;
