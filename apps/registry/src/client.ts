import { joinURL } from "@director.run/utilities/url";
import { createTRPCClient } from "@trpc/client";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";
import type { AppRouter } from "./routers/trpc";

export function createRegistryClient(
  baseURL: string,
  { apiKey }: { apiKey?: string } = {},
) {
  const url = joinURL(baseURL, "/trpc");
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url,
        transformer: superjson,
        async fetch(url, options) {
          return fetch(url, {
            ...options,
            headers: apiKey
              ? { ...options?.headers, "x-api-key": apiKey }
              : options?.headers,
          } as RequestInit).catch((error) => {
            if (error.code === "ConnectionRefused") {
              throw new Error(
                `Could not connect to the registry service on ${baseURL}. Is it running?`,
              );
            }
            throw error;
          });
        },
      }),
    ],
  });
}

export type RegistryClient = ReturnType<typeof createRegistryClient>;

export type RegistryRouterInputs = inferRouterInputs<AppRouter>;

export type RegistryRouterOutputs = inferRouterOutputs<AppRouter>;
