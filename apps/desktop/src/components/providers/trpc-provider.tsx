"use client";

import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TRPCClientError, httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { toast } from "sonner";
import superjson from "superjson";

export function TRPCProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
          mutations: {
            onError: (error) => {
              if (error instanceof TRPCClientError) {
                toast.error(`Error: ${error.message}`);
              } else {
                toast.error("An unexpected error occurred");
                console.error(error);
              }
            },
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:3000/trpc",
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </trpc.Provider>
    </QueryClientProvider>
  );
}
