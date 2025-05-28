"use client";

import { ProxySkeleton } from "@/components/proxies/proxy-skeleton";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProxiesPage() {
  const router = useRouter();
  const { data } = trpc.store.getAll.useQuery();

  useEffect(() => {
    if (data) {
      if (data.length > 0) {
        router.push(`/${data[0].id}`);
      } else if (data.length === 0) {
        router.push("/new");
      }
    }
  }, [data, router]);

  return <ProxySkeleton />;
}
