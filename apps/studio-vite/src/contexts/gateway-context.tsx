import { createGatewayClient } from "@director.run/gateway/client";
import type { AppRouter as GatewayAppRouter } from "@director.run/gateway/routers/trpc/index";
import { createRegistryClient } from "@director.run/registry/client";
import type { AppRouter as RegistryAppRouter } from "@director.run/registry/routers/trpc/index";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import React, { createContext } from "react";

const A = (() => {
  return {
    trpc: createTRPCReact<GatewayAppRouter>({}),
    queryClient: new QueryClient(),
  };
})();

const B = (() => {
  return {
    trpc: createTRPCReact<RegistryAppRouter>({
      context: createContext(null),
    }),
    queryClient: new QueryClient(),
  };
})();

export const gatewayClient = A.trpc;
export const registryClient = B.trpc;

export function GatewayProvider(
  props: Readonly<{
    gatewayUrl: string;
    registryUrl: string;
    children: React.ReactNode;
  }>,
) {
  const [trpcClient] = useState(() =>
    createGatewayClient(`${props.gatewayUrl}/trpc`),
  );

  const [registryClient] = useState(() =>
    createRegistryClient(props.registryUrl),
  );

  return (
    <A.trpc.Provider queryClient={A.queryClient} client={trpcClient}>
      <QueryClientProvider client={A.queryClient}>
        <B.trpc.Provider queryClient={B.queryClient} client={registryClient}>
          <QueryClientProvider client={B.queryClient}>
            {props.children}
          </QueryClientProvider>
        </B.trpc.Provider>
      </QueryClientProvider>
    </A.trpc.Provider>
  );
}
