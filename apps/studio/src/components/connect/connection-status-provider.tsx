"use client";

import { useEffect, useState } from "react";

import { useIsClient } from "@/hooks/use-is-client";
import { createCtx } from "@/lib/create-ctx";
import { trpc } from "@/trpc/client";
import { ConnectionEmptyState } from "./connection-empty-state";
import { ConnectionStatusDialog } from "./connection-status-dialog";

const [useContext, ContextProvider] = createCtx<{
  connected: boolean;
  showDialog: boolean;
}>("connectionStatus");

export function ConnectionStatusProvider({
  children,
}: { children: React.ReactNode }) {
  const isClient = useIsClient();

  const [connected, setConnected] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

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
      setShowDialog(true);
    } else {
      setShowDialog(false);
    }
  }, [isRefetchError, connected, isFetchedAfterMount]);

  return (
    <ContextProvider value={{ connected, showDialog }}>
      {connected ? (
        <>
          {children}
          <ConnectionStatusDialog />
        </>
      ) : (
        <ConnectionEmptyState />
      )}
    </ContextProvider>
  );
}

export const useConnectionStatus = useContext;
