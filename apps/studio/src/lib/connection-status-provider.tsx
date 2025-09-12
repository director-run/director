"use client";

import { useEffect, useState } from "react";

import { useIsClient } from "@/hooks/use-is-client";
import { createCtx } from "@/lib/create-ctx";
import { trpc } from "@/trpc/client";
import { ConnectionEmptyState } from "../components/connect/connection-empty-state";
import { ConnectionLostDialog } from "../components/connect/connection-lost-dialog";

import cliPackage from "@director.run/cli/package.json";
import { ConnectionUpdateState } from "../components/connect/connection-update-state";

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
  cliVersion: string | null;
}>("connectionStatus");

export function ConnectionStatusProvider({
  children,
}: { children: React.ReactNode }) {
  const isClient = useIsClient();

  const [needsUpdate, setNeedsUpdate] = useState(false);
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
      if (data?.cliVersion && data.cliVersion !== cliPackage.version) {
        setNeedsUpdate(true);
      }
    } else {
      setConnected(false);
      setNeedsUpdate(false);
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

  if (needsUpdate) {
    return (
      <ConnectionUpdateState
        cliVersion={data?.cliVersion ?? null}
        studioVersion={cliPackage.version}
      />
    );
  }

  return (
    <ContextProvider
      value={{
        connected,
        lostConnection,
        dependencies: data?.dependencies ?? [],
        clients: data?.clients ?? [],
        cliVersion: data?.cliVersion ?? null,
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
