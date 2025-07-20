import { createClient } from "@director.run/utilities/trpc";
import { joinURL } from "@director.run/utilities/url";
import type { AppRouter } from "./trpc/routers/_app";

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
