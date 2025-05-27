"use client";

import { trpc } from "@/trpc/client";

export function useProxy(proxyId: string) {
  const [proxy, claude, cursor] = trpc.useQueries((t) => [
    t.store.get({ proxyId }),
    t.installer.claude.list(),
    t.installer.cursor.list(),
  ]);

  const isLoading =
    proxy.isLoading ||
    claude.isLoading ||
    cursor.isLoading ||
    proxy.error?.message === "Failed to fetch";

  return {
    proxy: proxy.data,
    isLoading,
    installers: {
      cursor: !!cursor.data?.find((i) => i.name === `director__${proxyId}`),
      claude: !!claude.data?.find((i) => i.name === `director__${proxyId}`),
    },
  };
}
