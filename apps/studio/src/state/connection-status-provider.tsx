"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Logo } from "@/components/ui/icons/logo";
import { trpc } from "@/state/client";
import cliPackage from "@director.run/cli/package.json";
import { useEffect, useState } from "react";
import { createContext, useContext } from "react";
import { ConnectionEmptyState } from "../components/connect/connection-empty-state";
import { ConnectionUpdateState } from "../components/connect/connection-update-state";

function ConnectionLostDialog() {
  const { lostConnection } = useConnectionStatus();

  return (
    <Dialog open={lostConnection}>
      <DialogContent dismissable={false}>
        <DialogHeader>
          <Logo className="mb-3" />
          <DialogTitle>Director has lost connection</DialogTitle>
          <DialogDescription>
            Please check that the service is running.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

const [useCtx, CtxProvider] = createCtx<{
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
    <CtxProvider
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
    </CtxProvider>
  );
}

export const useConnectionStatus = useCtx;

/**
 * A helper to create a Context and Provider with no upfront default value, and
 * without having to check for undefined all the time.
 * @link https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context/
 */
function createCtx<T extends object>(name: string) {
  const ctx = createContext<T | undefined>(undefined);

  function useCtx() {
    const c = useContext(ctx);
    if (c === undefined) {
      throw new Error(
        `use${name} must be inside a ${name}Provider with a value`,
      );
    }
    return c;
  }
  function Provider(props: {
    children: React.ReactNode;
    value: T;
  }) {
    return <ctx.Provider value={props.value}>{props.children}</ctx.Provider>;
  }

  return [useCtx, Provider] as const; // 'as const' makes TypeScript infer a tuple
}

let hasEverMounted = false;

function useIsClient() {
  const [isClient, setClient] = useState(hasEverMounted);

  useEffect(() => {
    setClient(true);
    hasEverMounted = true;
  }, []);

  return isClient;
}
