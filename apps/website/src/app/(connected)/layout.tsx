"use client";

import { useConnectContext } from "@/components/connect/connect-context";
import {
  DefaultLayout,
  DefaultLayoutContent,
  DefaultLayoutFooter,
} from "@/components/default-layout";
import { ProxiesFallback } from "@/components/proxies/proxies-fallback";
import { ProxiesLayoutHeader } from "@/components/proxies/proxies-layout";
import { DefaultFallback, NoSSRSuspense } from "@/lib/no-ssr-suspense";

export default function DisconnectedLayout({
  children,
}: { children: React.ReactNode }) {
  const { status } = useConnectContext();

  return (
    <NoSSRSuspense fallback={<ProxiesFallback />}>
      <DefaultLayout>
        <ProxiesLayoutHeader />
        <DefaultLayoutContent>
          {status === "loading" ? <DefaultFallback /> : children}
        </DefaultLayoutContent>
        <DefaultLayoutFooter />
      </DefaultLayout>
    </NoSSRSuspense>
  );
}
