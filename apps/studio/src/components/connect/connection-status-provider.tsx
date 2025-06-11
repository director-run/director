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
    if (data?.status === "ok") {
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
    <ContextProvider value={{ connected, lostConnection }}>
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
