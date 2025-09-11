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

  const installers = installersQuery.data ?? {};
  const isInstalled = !!Object.values(installers).filter((it) => Boolean(it))
    .length;

  const createStepStatus = hasProxy ? "completed" : "in-progress";
  const addStepStatus =
    createStepStatus !== "completed" || !currentProxy
      ? "not-started"
      : currentProxy.servers.length > 0
        ? "completed"
        : "in-progress";
  const connectStepStatus =
    addStepStatus === "completed" && isInstalled
      ? "completed"
      : addStepStatus === "completed" && installersQuery.isFetched
        ? "in-progress"
        : "not-started";

  const isCompleted =
    createStepStatus === "completed" &&
    addStepStatus === "completed" &&
    connectStepStatus === "completed";

  return (
    <GetStartedPageView
      isLoading={!hasData}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      registryEntries={registryEntriesQuery.data?.entries ?? []}
      currentProxy={currentProxy}
      createStepStatus={createStepStatus}
      addStepStatus={addStepStatus}
      connectStepStatus={connectStepStatus}
      isCompleted={isCompleted}
      hasProxy={!!hasProxy}
    />
  );
}
