import { createGatewayClient } from "@director.run/gateway/client";
import type { AppRouter as GatewayAppRouter } from "@director.run/gateway/routers/trpc/index";
import { createRegistryClient } from "@director.run/registry/client";
import type { AppRouter as RegistryAppRouter } from "@director.run/registry/routers/trpc/index";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import React, { createContext } from "react";

export const gatewayClient = createTRPCReact<GatewayAppRouter>({});
export const registryClient = createTRPCReact<RegistryAppRouter>({
  context: createContext(null),
});

const gatewayQueryClient = new QueryClient();
const registryQueryClient = new QueryClient();

export function BackendProvider(
  props: Readonly<{
    gatewayUrl: string;
    registryUrl: string;
    children: React.ReactNode;
  }>,
) {
  const [gatewayTrpcClient] = useState(() =>
    createGatewayClient(`${props.gatewayUrl}/trpc`),
  );

  const [registryTrpcClient] = useState(() =>
    createRegistryClient(props.registryUrl),
  );

  return (
    <gatewayClient.Provider
      queryClient={gatewayQueryClient}
      client={gatewayTrpcClient}
    >
      <QueryClientProvider client={gatewayQueryClient}>
        <registryClient.Provider
          queryClient={registryQueryClient}
          client={registryTrpcClient}
        >
          <QueryClientProvider client={registryQueryClient}>
            {props.children}
          </QueryClientProvider>
        </registryClient.Provider>
      </QueryClientProvider>
    </gatewayClient.Provider>
  );
}
