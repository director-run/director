"use client";

import { DefaultFallback } from "@/lib/no-ssr-suspense";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { data } = trpc.store.getAll.useQuery();

  useEffect(() => {
    if (data) {
      if (data.length === 1) {
        router.push(`/proxies/${data[0].id}`);
      } else if (data.length === 0) {
        router.push("/proxies/new");
      } else {
        router.push("/proxies");
      }
    }
  }, [data, router]);

  return <DefaultFallback />;
}
