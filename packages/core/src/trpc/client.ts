import { createTRPCClient } from "@trpc/client";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import superjson from "superjson";
import { env } from "../config";
import type { AppRouter } from "./routers/_app-router";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `http://localhost:${env.SERVER_PORT}/trpc`,
      transformer: superjson,
      async fetch(url, options) {
        return fetch(url, options).catch((error) => {
          if (error.code === "ConnectionRefused") {
            throw new Error(
              `Could not connect to the service on http://localhost:${env.SERVER_PORT}/trpc. Is it running?`,
            );
          }
          throw error;
        });
      },
    }),
  ],
});
