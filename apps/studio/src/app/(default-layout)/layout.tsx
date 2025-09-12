"use client";

import { LayoutRoot } from "@/components/layout/layout";
import { trpc } from "@/state/client";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: servers, isLoading, error } = trpc.store.getAll.useQuery();

  return (
    <LayoutRoot servers={servers} isLoading={isLoading} error={error?.message}>
      {children}
    </LayoutRoot>
  );
}
