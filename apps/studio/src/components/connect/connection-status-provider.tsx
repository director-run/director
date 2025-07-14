"use client";

import { useEffect, useState } from "react";

import { useIsClient } from "@/hooks/use-is-client";
import { createCtx } from "@/lib/create-ctx";
import { trpc } from "@/trpc/client";
import { ConnectionEmptyState } from "./connection-empty-state";
import { ConnectionLostDialog } from "./connection-lost-dialog";

const [useContext, ContextProvider] = createCtx<{
  connected: boolean;
  lostConnection: boolean;
  dependencies: {
    name: string;
    installed: boolean;
  }[];
  clients: {
    name: string;
    installed: boolean;
    configExists: boolean;
    configPath: string;
  }[];
  servers: {
    proxyId: string;
    proxyName: string;
    serverName: string;
    status: string;
    lastError?: string | null;
    lastErrorAt?: Date | null;
    connectedAt?: Date | null;
    lastAttemptAt?: Date | null;
    errorCategory?: string | null;
    isRetryable?: boolean | null;
    suggestedAction?: string | null;
    circuitBreakerState?: string | null;
  }[];
}>("connectionStatus");

export function ConnectionStatusProvider({
  children,
}: { children: React.ReactNode }) {
  const isClient = useIsClient();

  const [connected, setConnected] = useState(false);
  const [lostConnection, setLostConnection] = useState(false);

  const utils = trpc.useUtils();
  const { data, isRefetchError, isFetchedAfterMount } = trpc.health.useQuery(
    undefined,
    {
      refetchInterval: 1_000,
      retry: false,
      retryDelay: 1_000,
      throwOnError: false,
      enabled: isClient,
    },
  );

  useEffect(() => {
    if (data) {
      setConnected(true);
    } else {
      setConnected(false);
    }
  }, [data]);

  useEffect(() => {
    if (connected) {
      utils.store.getAll.invalidate();
      utils.store.get.invalidate();
    }
  }, [connected]);

  useEffect(() => {
    if ((data === undefined && isFetchedAfterMount) || isRefetchError) {
      setLostConnection(true);
    } else {
      setLostConnection(false);
    }
  }, [isRefetchError, connected, isFetchedAfterMount]);

  return (
    <ContextProvider
      value={{
        connected,
        lostConnection,
        dependencies: data?.dependencies ?? [],
        clients: data?.clients ?? [],
        servers:
          (
            data as {
              servers?: Array<{
                proxyId: string;
                proxyName: string;
                serverName: string;
                status: string;
                lastError?: string | null;
                lastErrorAt?: Date | null;
                connectedAt?: Date | null;
                lastAttemptAt?: Date | null;
                responseTime?: number | null;
                healthCheckUrl?: string | null;
                circuitBreakerState?: string | null;
              }>;
            }
          )?.servers ?? [],
      }}
    >
      {connected ? (
        <>
          {children}
          <ConnectionLostDialog />
        </>
      ) : (
        <ConnectionEmptyState />
      )}
    </ContextProvider>
  );
}

export const useConnectionStatus = useContext;
