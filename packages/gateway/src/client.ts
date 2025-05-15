import { joinURL } from "@director.run/utilities/url";
import { createTRPCClient } from "@trpc/client";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import superjson from "superjson";
import type { AppRouter } from "./routers/trpc";

export function createGatewayClient(baseURL: string) {
  const url = joinURL(baseURL, "/trpc");
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url,
        transformer: superjson,
        async fetch(url, options) {
          return fetch(url, options).catch((error) => {
            if (error.code === "ConnectionRefused") {
              throw new Error(
                `Could not connect to the service on ${baseURL}. Is it running?`,
              );
            }
            throw error;
          });
        },
      }),
    ],
  });
}

export function createClient<TRouter>(url: string) {
  return createTRPCClient<TRouter>({
    links: [
      httpBatchLink({
        url,
        transformer: superjson,
        async fetch(url, options) {
          return fetch(url, options).catch((error) => {
            if (error.code === "ConnectionRefused") {
              throw new Error(
                `Could not connect to the service on ${url}. Is it running?`,
              );
            }
            throw error;
          });
        },
      }),
    ],
  });
}
