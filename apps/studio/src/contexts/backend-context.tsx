import { createGatewayClient } from "@director.run/gateway/client";
import type { AppRouter as GatewayAppRouter } from "@director.run/gateway/routers/trpc/index";
import { createRegistryClient } from "@director.run/registry/client";
import type { AppRouter as RegistryAppRouter } from "@director.run/registry/routers/trpc/index";
import {
  MutationCache,
  QueryCache,
  QueryClientProvider,
} from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export const gatewayClient = createTRPCReact<GatewayAppRouter>({});
export const registryClient = createTRPCReact<RegistryAppRouter>({
  context: createContext(null),
});

function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof TRPCClientError) {
    return error.data?.code === "UNAUTHORIZED";
  }
  return false;
}

type AuthErrorHandler = () => void;

const AuthErrorContext = createContext<{
  setOnAuthError: (handler: AuthErrorHandler | null) => void;
}>({
  setOnAuthError: () => {},
});

export function useAuthErrorHandler(handler: AuthErrorHandler) {
  const { setOnAuthError } = useContext(AuthErrorContext);
  useEffect(() => {
    setOnAuthError(handler);
    return () => setOnAuthError(null);
  }, [setOnAuthError, handler]);
}

export function BackendProvider(
  props: Readonly<{
    gatewayUrl: string;
    registryUrl: string;
    children: React.ReactNode;
  }>,
) {
  const [authErrorHandler, setAuthErrorHandler] =
    useState<AuthErrorHandler | null>(null);

  const handleError = useCallback(
    (error: unknown) => {
      if (isUnauthorizedError(error) && authErrorHandler) {
        authErrorHandler();
      }
    },
    [authErrorHandler],
  );

  const [gatewayQueryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (isUnauthorizedError(error)) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
        queryCache: new QueryCache({
          onError: handleError,
        }),
        mutationCache: new MutationCache({
          onError: handleError,
        }),
      }),
  );

  const [registryQueryClient] = useState(() => new QueryClient());

  const [gatewayTrpcClient] = useState(() =>
    createGatewayClient(`${props.gatewayUrl}/trpc`),
  );

  const [registryTrpcClient] = useState(() =>
    createRegistryClient(props.registryUrl),
  );

  const setOnAuthError = useCallback((handler: AuthErrorHandler | null) => {
    setAuthErrorHandler(() => handler);
  }, []);

  return (
    <AuthErrorContext.Provider value={{ setOnAuthError }}>
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
    </AuthErrorContext.Provider>
  );
}
