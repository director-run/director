"use client";

import type { AppRouter } from "@director.run/service/trpc/routers/_app-router";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
} from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";
import { makeQueryClient } from "./query-client";

export const trpc = createTRPCReact<AppRouter>();

let clientQueryClientSingleton: QueryClient;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient());
}

const TRPC_ENDPOINT = `http://localhost:3000/trpc`;

export function TRPCProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        splitLink({
          condition: (op) => isNonJsonSerializable(op.input),
          // @ts-ignore - it needs the tarnsformer but it doesn't work with handling form data 🤷‍♂️
          true: httpLink({
            url: TRPC_ENDPOINT,
            headers: () => {
              const headers = new Headers();
              headers.set("x-trpc-source", "client");
              return headers;
            },
            // transformer: superjson,
          }),
          false: httpBatchLink({
            transformer: superjson,
            url: TRPC_ENDPOINT,
            headers: () => {
              const headers = new Headers();
              headers.set("x-trpc-source", "client");
              return headers;
            },
          }),
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
