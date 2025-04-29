"use client";

import { useIsClient } from "@/hooks/use-is-client";
import { createCtx } from "@/lib/create-ctx";
import { trpc } from "@/trpc/client";
import { ProxyAttributes } from "@director.run/db/schema";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type ConnectStatus = "loading" | "ready";

interface ConnectContext {
  status: ConnectStatus;
  proxies: ProxyAttributes[];
  selectedProxy: ProxyAttributes | null;
}

const [useCtx, CtxProvider] = createCtx<ConnectContext>("ConnectContext");

export const ConnectProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const isClient = useIsClient();
  const { proxyId } = useParams<{ proxyId: string }>();
  const [status, setStatus] = useState<ConnectStatus>("loading");

  const { data } = trpc.store.getAll.useQuery(undefined, {
    refetchInterval(query) {
      if (query.state.status === "success") {
        return 10_000;
      }
      return 1_000;
    },
    retry: false,
    throwOnError: false,
    enabled: isClient,
  });

  useEffect(() => {
    if (data) {
      setStatus("ready");
    }
  }, [data]);

  const selectedProxy = useMemo(() => {
    if (!proxyId) {
      return null;
    }
    return data?.find((proxy) => proxy.id === proxyId) ?? null;
  }, [data, proxyId]);

  return (
    <CtxProvider value={{ status, proxies: data ?? [], selectedProxy }}>
      {children}
    </CtxProvider>
  );
};

export const useConnectContext = useCtx;
