"use client";

import { useConnectContext } from "@/components/connect/connect-context";
import { DefaultFallback } from "@/lib/no-ssr-suspense";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ManageRedirect() {
  const { proxies, status } = useConnectContext();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (proxies.length === 0) {
      router.replace("/proxies/new");
    } else {
      router.replace(`/proxies/${proxies[0].id}`);
    }
  }, [proxies, router, status]);

  return <DefaultFallback />;
}
