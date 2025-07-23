import { createClient } from "@director.run/utilities/trpc";
import { joinURL } from "@director.run/utilities/url";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "./routers/trpc";

export function createRegistryClient(
  baseURL: string,
  options: { apiKey?: string } = {},
) {
  const url = joinURL(baseURL, "/trpc");
  return createClient<AppRouter>(
    url,
    options.apiKey
      ? {
          headers: {
            "x-api-key": options.apiKey,
          },
        }
      : undefined,
  );
}

export type RegistryClient = ReturnType<typeof createRegistryClient>;

export type RegistryRouterInputs = inferRouterInputs<AppRouter>;

export type RegistryRouterOutputs = inferRouterOutputs<AppRouter>;
