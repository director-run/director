"use client";
import { useProxyQueryStates } from "@/hooks/use-proxy-query-states";
import { createCtx } from "@/lib/create-ctx";
import { trpc } from "@/lib/trpc";
import type { Proxy } from "@director/backend/src/services/db/schema";
import {} from "nuqs";
import {} from "react";
import { LoadingView } from "../loading-view";
import { useConnectionContext } from "../providers/connection-provider";

export interface ProxyContext {
  currentProxyId: string | null;
  currentProxy: Proxy | null;
  proxyIds: string[];
  proxyById: Record<string, Proxy>;
}

const [useContext, ContextProvider] = createCtx<ProxyContext>();

export function ProxyContextProvider({
  children,
}: { children: React.ReactNode }) {
  const { status } = useConnectionContext();
  const [proxyQueryStates] = useProxyQueryStates();

  const { data, isLoading } = trpc.store.getAll.useQuery(undefined, {
    enabled: status === "connected",
  });

  const proxyIds = data?.map((it) => it.id) ?? [];

  const proxyById = (() => {
    return (
      data?.reduce(
        (acc, it) => {
          acc[it.id] = it;
          return acc;
        },
        {} as Record<string, Proxy>,
      ) ?? {}
    );
  })();

  const currentProxy = proxyById[proxyQueryStates.proxyId as string] ?? null;

  return (
    <ContextProvider
      value={{
        currentProxyId: proxyQueryStates.proxyId,
        currentProxy,
        proxyIds,
        proxyById,
      }}
    >
      {isLoading && (data ?? []).length === 0 ? <LoadingView /> : children}
    </ContextProvider>
  );
}

export const useProxyContext = useContext;
