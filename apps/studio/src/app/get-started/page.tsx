"use client";

import { GetStartedPageView } from "@/components/pages/get-started-page-view";
import { trpc } from "@/trpc/client";
import { useEffect, useState } from "react";

export default function GetStartedPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentProxyId, setCurrentProxyId] = useState<string | null>(null);

  const proxyListQuery = trpc.store.getAll.useQuery();
  const registryEntriesQuery = trpc.registry.getEntries.useQuery(
    {
      pageIndex: 0,
      pageSize: 20,
      searchQuery,
    },
    {
      placeholderData: (prev) => prev,
    },
  );

  const installersQuery = trpc.installer.byProxy.list.useQuery(
    {
      proxyId: currentProxyId as string,
    },
    {
      enabled: !!currentProxyId,
    },
  );

  const hasData = proxyListQuery.data && registryEntriesQuery.data;

  useEffect(() => {
    if (proxyListQuery.data && proxyListQuery.data.length === 1) {
      setCurrentProxyId(proxyListQuery.data[0].id);
    }
  }, [proxyListQuery.data]);

  const hasProxy = proxyListQuery.data && proxyListQuery.data.length > 0;
  const currentProxy = hasProxy ? proxyListQuery.data[0] : null;
  const hasServers = (currentProxy?.servers.length ?? 0) > 0;
  const hasInstallers =
    installersQuery.data && Object.values(installersQuery.data).some(Boolean);

  // Simplified step logic
  const steps = {
    create: hasProxy ? "completed" : "in-progress",
    add: hasProxy ? (hasServers ? "completed" : "in-progress") : "not-started",
    connect:
      hasProxy && hasServers
        ? hasInstallers
          ? "completed"
          : "in-progress"
        : "not-started",
  } as const;

  const isCompleted =
    steps.create === "completed" &&
    steps.add === "completed" &&
    steps.connect === "completed";

  return (
    <GetStartedPageView
      isLoading={!hasData}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      registryEntries={registryEntriesQuery.data?.entries ?? []}
      currentProxy={currentProxy}
      steps={steps}
      isCompleted={isCompleted}
    />
  );
}
