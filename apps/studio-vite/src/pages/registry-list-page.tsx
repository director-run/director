import { LayoutBreadcrumbHeader } from "@director.run/studio/components/layout/layout-breadcrumb-header.tsx";
import { LayoutView } from "@director.run/studio/components/layout/layout.tsx";
import { LayoutViewContent } from "@director.run/studio/components/layout/layout.tsx";
import { WorkspaceTargetAddSheet } from "@director.run/studio/components/mcp-servers/mcp-add-sheet.tsx";
import type { WorkspaceTargetFormData } from "@director.run/studio/components/mcp-servers/mcp-add-sheet.tsx";
import { RegistryItemList } from "@director.run/studio/components/pages/registry-item-list.tsx";
import { RegistryLibrarySkeleton } from "@director.run/studio/components/registry/registry-library-skeleton.tsx";
import { EmptyState } from "@director.run/studio/components/ui/empty-state.tsx";
import { EmptyStateTitle } from "@director.run/studio/components/ui/empty-state.tsx";
import { EmptyStateDescription } from "@director.run/studio/components/ui/empty-state.tsx";
import { toast } from "@director.run/studio/components/ui/toast.js";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registryClient } from "../contexts/gateway-context";
import { gatewayClient } from "../contexts/gateway-context";

export const RegistryListPage: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const { data: workspaces } = gatewayClient.store.getAll.useQuery();

  const navigate = useNavigate();

  const { data, isLoading, error } = registryClient.entries.getEntries.useQuery(
    {
      pageIndex,
      pageSize: 20,
      searchQuery,
    },
    {
      placeholderData: (prev) => prev,
    },
  );

  const utils = gatewayClient.useUtils();

  const addServerMutation = gatewayClient.store.addServer.useMutation({
    onSuccess: async (data, variables) => {
      await utils.store.getAll.invalidate();
      await utils.store.get.invalidate({ proxyId: variables.proxyId });

      toast({
        title: "Server added",
        description: "The server has been added to the proxy",
      });
      setAddSheetOpen(false);
      navigate(`/${variables.proxyId}`);
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
    return <div className="page">Loading...</div>;
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
          onEntryClick={(entryName) => navigate(`/library/mcp/${entryName}`)}
        />

        <WorkspaceTargetAddSheet
          open={addSheetOpen}
          onOpenChange={setAddSheetOpen}
          workspaces={workspaces}
          onSubmit={handleAddServer}
          isSubmitting={addServerMutation.isPending}
        />
      </LayoutViewContent>
    </LayoutView>
  );
};
