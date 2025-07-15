import "server-only";

import { createCallerFactory, createTRPCContext } from "@/trpc/init";
import { makeQueryClient } from "@/trpc/query-client";
import { type AppRouter, appRouter } from "@/trpc/routers/_app";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { cache } from "react";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = await headers();
  const headersObject = new Headers();

  for (const [key, value] of Array.from(heads.entries())) {
    headersObject.set(key, value);
  }

  headersObject.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: headersObject,
  });
});

export const getQueryClient = cache(makeQueryClient);

const caller = createCallerFactory(appRouter)(createContext);

const hydrationHelpers: ReturnType<typeof createHydrationHelpers<AppRouter>> =
  createHydrationHelpers<AppRouter>(caller, getQueryClient);

export const trpc: typeof hydrationHelpers.trpc = hydrationHelpers.trpc;
export const HydrateClient: typeof hydrationHelpers.HydrateClient =
  hydrationHelpers.HydrateClient;
