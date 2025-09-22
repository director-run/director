import { createGatewayClient } from "@director.run/gateway/client";
import type { AppRouter } from "@director.run/gateway/routers/trpc/index";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";

export const gatewayClient = createTRPCReact<AppRouter>();

const eueryClientSingleton = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      throwOnError: true,
      retry: false,
    },
    dehydrate: {
      serializeData: superjson.serialize,
      shouldDehydrateQuery: (query) =>
        defaultShouldDehydrateQuery(query) || query.state.status === "pending",
    },
    hydrate: {
      deserializeData: superjson.deserialize,
    },
  },
});

export function GatewayProvider(
  props: Readonly<{
    gatewayUrl: string;
    children: React.ReactNode;
  }>,
) {
  console.log("GatewayProvider", props.gatewayUrl);
  const [trpcClient] = useState(() =>
    createGatewayClient(`${props.gatewayUrl}/trpc`),
  );

  return (
    <gatewayClient.Provider
      client={trpcClient}
      queryClient={eueryClientSingleton}
    >
      <QueryClientProvider client={eueryClientSingleton}>
        {props.children}
      </QueryClientProvider>
    </gatewayClient.Provider>
  );
}
