"use client";

import { RedirectView } from "@/components/loading-view";
import { useProxyContext } from "@/components/proxy/proxy-context";

export default function Home() {
  const { proxyIds } = useProxyContext();

  const redirectTo =
    proxyIds.length > 0 ? `/proxy?proxyId=${proxyIds[0]}` : "/get-started";

  return <RedirectView redirectTo={redirectTo} />;
}
