import type { AppRouter } from "@director.run/core/http/routers/trpc/index";
import { createTRPCClient } from "@trpc/client";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import superjson from "superjson";
import * as config from "./config";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: config.DIRECTOR_URL,
      transformer: superjson,
      async fetch(url, options) {
        return fetch(url, options).catch((error) => {
          if (error.code === "ConnectionRefused") {
            throw new Error(
              `Could not connect to the service on ${config.DIRECTOR_URL}. Is it running?`,
            );
          }
          throw error;
        });
      },
    }),
  ],
});
