import type { AppRouter } from "@director/backend/router";
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

/**
 * The main tRPC React client instance.
 *
 * This object provides access to all your tRPC procedures as React Query hooks.
 * Import this in your components to make tRPC requests.
 *
 * @example
 * import { trpc } from './trpc/client';
 *
 * // In a component:
 * const greeting = trpc.greeting.useQuery({ name: "World" });
 * console.log(greeting.data); // "Hello World"
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Singleton instance of the QueryClient for the browser environment.
 * This ensures we reuse the same QueryClient across the application.
 */
let clientQueryClientSingleton: QueryClient;

/**
 * Gets or creates a QueryClient instance.
 *
 * In a desktop application, we always use a singleton pattern to maintain
 * a single query cache throughout the application's lifecycle.
 *
 * @returns A QueryClient instance configured for the application
 */
function getQueryClient() {
  // In a desktop app, we're always in a browser environment
  // Use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient());
}

/**
 * Returns the URL for the tRPC API endpoint.
 *
 * In a desktop application, this should point to the local backend server.
 * For development, we use localhost:3000/trpc.
 */
function getUrl() {
  // For desktop app, we're always connecting to the local backend
  return "http://localhost:3000/trpc";
}

/**
 * TRPCProvider sets up the tRPC client and React Query for the application.
 *
 * This provider should be used at the root of your application to enable
 * tRPC hooks and queries throughout your component tree.
 *
 * @example
 * // In your main.tsx or App.tsx:
 * import { TRPCProvider } from './trpc/client';
 *
 * ReactDOM.createRoot(document.getElementById("root")).render(
 *   <React.StrictMode>
 *     <TRPCProvider>
 *       <App />
 *     </TRPCProvider>
 *   </React.StrictMode>
 * );
 *
 * // Then in your components, you can use the trpc hooks:
 * import { trpc } from './trpc/client';
 *
 * function MyComponent() {
 *   // Use the greeting procedure from your router
 *   const { data, isLoading } = trpc.greeting.useQuery({ name: "User" });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   return <div>{data}</div>;
 * }
 */
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
            url: getUrl(),
            headers: () => {
              const headers = new Headers();
              headers.set("x-trpc-source", "client");
              return headers;
            },
            // transformer: superjson,
          }),
          false: httpBatchLink({
            transformer: superjson,
            url: getUrl(),
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
