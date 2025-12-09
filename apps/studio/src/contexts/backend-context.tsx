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
  useRef,
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

function isPendingUserError(error: unknown): boolean {
  if (error instanceof TRPCClientError) {
    return error.data?.code === "FORBIDDEN" && error.message === "USER_PENDING";
  }
  return false;
}

type ErrorHandler = () => void;

const AuthErrorContext = createContext<{
  setOnAuthError: (handler: ErrorHandler | null) => void;
  setOnPendingError: (handler: ErrorHandler | null) => void;
}>({
  setOnAuthError: () => {},
  setOnPendingError: () => {},
});

export function useAuthErrorHandler(handler: ErrorHandler) {
  const { setOnAuthError } = useContext(AuthErrorContext);
  useEffect(() => {
    setOnAuthError(handler);
    return () => setOnAuthError(null);
  }, [setOnAuthError, handler]);
}

export function usePendingErrorHandler(handler: ErrorHandler) {
  const { setOnPendingError } = useContext(AuthErrorContext);
  useEffect(() => {
    setOnPendingError(handler);
    return () => setOnPendingError(null);
  }, [setOnPendingError, handler]);
}

export function BackendProvider(
  props: Readonly<{
    gatewayUrl: string;
    registryUrl: string;
    children: React.ReactNode;
  }>,
) {
  // Use refs to avoid stale closures in QueryCache callbacks.
  // The QueryClient is created once and captures the handleError callback,
  // so we need refs to always access the current handlers.
  const authErrorHandlerRef = useRef<ErrorHandler | null>(null);
  const pendingErrorHandlerRef = useRef<ErrorHandler | null>(null);

  const handleError = useCallback((error: unknown) => {
    if (isPendingUserError(error) && pendingErrorHandlerRef.current) {
      pendingErrorHandlerRef.current();
    } else if (isUnauthorizedError(error) && authErrorHandlerRef.current) {
      authErrorHandlerRef.current();
    }
  }, []);

  const [gatewayQueryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (isUnauthorizedError(error) || isPendingUserError(error)) {
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

  const setOnAuthError = useCallback((handler: ErrorHandler | null) => {
    authErrorHandlerRef.current = handler;
  }, []);

  const setOnPendingError = useCallback((handler: ErrorHandler | null) => {
    pendingErrorHandlerRef.current = handler;
  }, []);

  return (
    <AuthErrorContext.Provider value={{ setOnAuthError, setOnPendingError }}>
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
