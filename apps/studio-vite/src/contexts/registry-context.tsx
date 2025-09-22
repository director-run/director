import { createRegistryClient } from "@director.run/registry/client";
import type { AppRouter } from "@director.run/registry/routers/trpc/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCReact } from "@trpc/react-query";
import React, { useState } from "react";

export const trpc = createTRPCReact<AppRouter>();

export function RegistryProvider(
  props: Readonly<{
    registryUrl: string;
    children: React.ReactNode;
  }>,
) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => createRegistryClient(props.registryUrl));
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
