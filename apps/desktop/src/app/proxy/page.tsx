"use client";
import { LoadingView } from "@/components/loading-view";
import { ProxyView } from "@/components/proxy/proxy-view";
import { trpc } from "@/lib/trpc";
import { useQueryState } from "nuqs";
import { parseAsString } from "nuqs";

export default function ProxyPage() {
  const [proxyId] = useQueryState("proxyId", parseAsString);

  const { data: proxy, isLoading } = trpc.store.get.useQuery(
    {
      proxyId: proxyId as string,
    },
    {
      enabled: !!proxyId,
    },
  );

  if (isLoading) {
    return <LoadingView />;
  }

  if (!proxy) {
    return <div>Not found</div>;
  }

  return <ProxyView proxy={proxy} />;
}
