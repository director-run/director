import { createClient } from "@director.run/utilities/trpc";
import { joinURL } from "@director.run/utilities/url";
import type { AppRouter } from "./routers/trpc";

export function createRegistryClient(baseURL: string) {
  const url = joinURL(baseURL, "/trpc");
  return createClient<AppRouter>(url);
}

export type RegistryClient = ReturnType<typeof createRegistryClient>;
