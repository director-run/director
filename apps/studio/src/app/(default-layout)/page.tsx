"use client";

import { ProxySkeleton } from "@/components/proxies/proxy-skeleton";
import { trpc } from "@/state/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProxiesPage() {
  const router = useRouter();
  const { data, isLoading, error } = trpc.store.getAll.useQuery();

  useEffect(() => {
    if (data) {
      if (data.length > 0) {
        router.replace(`/${data[0].id}`);
      } else if (data.length === 0) {
        router.replace("/get-started");
      }
    }
  }, [data, router]);

  if (isLoading) {
    return <ProxySkeleton />;
  }

  if (error) {
    return <div>Error loading proxies: {error.message}</div>;
  }

  return <ProxySkeleton />;
}
