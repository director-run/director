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
import { useAddServer } from "../hooks/use-add-server";
import { useRegistryEntries } from "../hooks/use-registry-entries";
import { useWorkspaces } from "../hooks/use-workspaces";

export const RegistryListPage: React.FC = () => {
  const navigate = useNavigate();

  const [pageIndex, setPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const { data: workspaces } = useWorkspaces();
  const { data, isLoading, error } = useRegistryEntries({
    pageIndex,
    pageSize: 20,
    searchQuery,
  });
  const { addServer, isPending } = useAddServer({
    onSuccess: (_data, variables) => {
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

  if (isLoading) {
    return <RegistryLibrarySkeleton />;
  }

  if (!data || error) {
    return (
      <LayoutView>
        <LayoutViewContent>
          <div className="inset-0 grid place-items-center">
            <EmptyState>
              <EmptyStateTitle>Something went wrong.</EmptyStateTitle>
              <EmptyStateDescription>Please try again</EmptyStateDescription>
            </EmptyState>
          </div>
        </LayoutViewContent>
      </LayoutView>
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
          onSubmit={async (data: WorkspaceTargetFormData) => {
            if (!data.workspaceId) {
              toast({
                title: "No workspace selected",
                description: "Please select a proxy before adding a server.",
              });
              return;
            }

            await addServer({
              proxyId: data.workspaceId,
              server: {
                name: data.server.name,
                transport: data.server,
              },
            });
          }}
          isSubmitting={isPending}
        />
      </LayoutViewContent>
    </LayoutView>
  );
};
