"use client";
import { createCtx } from "@/lib/create-ctx";
import { trpc } from "@/lib/trpc";
import type { Proxy } from "@director/backend/src/services/db/schema";
import { parseAsString, useQueryState } from "nuqs";
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
  const [currentProxyId] = useQueryState("proxyId", parseAsString);

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

  const currentProxy = proxyById[currentProxyId as string] ?? null;

  return (
    <ContextProvider
      value={{ currentProxyId, currentProxy, proxyIds, proxyById }}
    >
      {isLoading && (data ?? []).length === 0 ? <LoadingView /> : children}
    </ContextProvider>
  );
}

export const useProxyContext = useContext;

export const useCurrentServer = () => {
  const { currentProxy } = useProxyContext();

  if (!currentProxy) {
    throw new Error("No current proxy");
  }

  return currentProxy;
};
