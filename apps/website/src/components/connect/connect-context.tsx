"use client";

import { useIsClient } from "@/hooks/use-is-client";
import { createCtx } from "@/lib/create-ctx";
import { trpc } from "@/trpc/client";
import { ProxyAttributes } from "@director.run/db/schema";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface ConnectContext {
  status: "loading" | "ready" | "error";
  proxies: ProxyAttributes[];
  selectedProxy: ProxyAttributes | null;
}

const [useCtx, CtxProvider] = createCtx<ConnectContext>("ConnectContext");

export const ConnectProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const { manageId } = useParams<{ manageId: string }>();
  const isClient = useIsClient();
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const { data } = trpc.store.getAll.useQuery(undefined, {
    refetchInterval(query) {
      if (query.state.status === "success") {
        return 60_000;
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
    if (!manageId) {
      return null;
    }
    return data?.find((proxy) => proxy.id === manageId) ?? null;
  }, [data, manageId]);

  return (
    <CtxProvider value={{ status, proxies: data ?? [], selectedProxy }}>
      {children}
    </CtxProvider>
  );
};

export const useConnectContext = useCtx;
