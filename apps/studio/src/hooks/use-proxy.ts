"use client";

import { trpc } from "@/trpc/client";

export function useProxy(proxyId: string) {
  const [proxy, clients] = trpc.useQueries((t) => [
    t.store.get({ proxyId }),
    t.installer.byProxy.list({ proxyId }),
  ]);

  const isLoading =
    proxy.isLoading ||
    clients.isLoading ||
    proxy.error?.message === "Failed to fetch";

  return {
    proxy: proxy.data,
    isLoading,
    installers: clients.data ?? { claude: false, cursor: false },
  };
}
