"use client";

import { ProxySkeleton } from "@director.run/design/components/proxies/proxy-skeleton.tsx";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { trpc } from "../../state/client";

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
