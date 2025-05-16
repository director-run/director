"use client";

import { NoSSRSuspense } from "@/lib/no-ssr-suspense";
import { ProxySelector } from "./proxies/proxy-selector";

export function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <NoSSRSuspense>
      <ProxySelector />
      {children}
    </NoSSRSuspense>
  );
}
