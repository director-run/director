"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";
import {
  LayoutView,
  LayoutViewContent,
} from "../../../components/layout/layout";
import { LayoutBreadcrumbHeader } from "../../../components/layout/layout-breadcrumb-header";
import { WorkspaceTargetAddSheet } from "../../../components/mcp-servers/mcp-add-sheet";
import type { WorkspaceTargetFormData } from "../../../components/mcp-servers/mcp-add-sheet";
import { RegistryItemList } from "../../../components/pages/registry-item-list";
import { RegistryLibrarySkeleton } from "../../../components/registry/registry-library-skeleton";
import { EmptyStateDescription } from "../../../components/ui/empty-state";
import { EmptyState } from "../../../components/ui/empty-state";
import { EmptyStateTitle } from "../../../components/ui/empty-state";
import { toast } from "../../../components/ui/toast";
import { trpc } from "../../../state/client";

export default function RegistryPage() {
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const { data, isLoading, error } = trpc.registry.getEntries.useQuery(
    {
      pageIndex,
      pageSize: 20,
      searchQuery,
    },
    {
      placeholderData: (prev) => prev,
    },
  );

  const { data: servers } = trpc.store.getAll.useQuery();

  const utils = trpc.useUtils();

  const addServerMutation = trpc.store.addServer.useMutation({
    onSuccess: async (data, variables) => {
      await utils.store.getAll.invalidate();
      await utils.store.get.invalidate({ proxyId: variables.proxyId });

      toast({
        title: "Server added",
        description: "The server has been added to the proxy",
      });
      setAddSheetOpen(false);
      router.push(`/${variables.proxyId}`);
    },
    onError: () => {
      toast({
        title: "Failed to add server",
        description: "Please check Director CLI logs for more information.",
      });
    },
  });

  const handleAddServer = async (data: WorkspaceTargetFormData) => {
    const server = data.server;

    if (!data.workspaceId) {
      toast({
        title: "No workspace selected",
        description: "Please select a proxy before adding a server.",
      });
      return;
    }

    const proxyId = data.workspaceId;

    if (server.type === "stdio") {
      await addServerMutation.mutateAsync({
        proxyId,
        server: {
          name: server.name,
          transport: server,
        },
      });
    } else {
      await addServerMutation.mutateAsync({
        proxyId,
        server: {
          name: data.server.name,
          transport: {
            type: "http",
            url: server.url,
            headers: server.headers,
          },
        },
      });
    }
  };

  if (isLoading) {
    return <RegistryLibrarySkeleton />;
  }

  if (!data || error) {
    return (
      <RegistryLibrarySkeleton>
        <div className="absolute inset-0 grid place-items-center">
          <EmptyState>
            <EmptyStateTitle>Something went wrong.</EmptyStateTitle>
            <EmptyStateDescription>Please try again</EmptyStateDescription>
          </EmptyState>
        </div>
      </RegistryLibrarySkeleton>
    );
  }

  return (
    <LayoutView>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: "Library",
          },
        ]}
      />

      <LayoutViewContent>
        <RegistryItemList
          entries={data.entries}
          pagination={data.pagination}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onPageChange={setPageIndex}
          onManualAddClick={() => setAddSheetOpen(true)}
          onEntryClick={(entryName) => router.push(`/library/mcp/${entryName}`)}
        />

        <WorkspaceTargetAddSheet
          open={addSheetOpen}
          onOpenChange={setAddSheetOpen}
          workspaces={servers}
          onSubmit={handleAddServer}
          isSubmitting={addServerMutation.isPending}
        />
      </LayoutViewContent>
    </LayoutView>
  );
}
