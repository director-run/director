import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutView } from "@director.run/design/components/layout/layout.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { PlaybookTargetAddSheet } from "@director.run/design/components/mcp-servers/mcp-add-sheet.tsx";
import type { PlaybookTargetFormData } from "@director.run/design/components/mcp-servers/mcp-add-sheet.tsx";
import { RegistryItemList } from "@director.run/design/components/pages/registry-item-list.tsx";
import { RegistryLibrarySkeleton } from "@director.run/design/components/registry/registry-library-skeleton.tsx";
import { EmptyState } from "@director.run/design/components/ui/empty-state.tsx";
import { EmptyStateTitle } from "@director.run/design/components/ui/empty-state.tsx";
import { EmptyStateDescription } from "@director.run/design/components/ui/empty-state.tsx";
import { toast } from "@director.run/design/components/ui/toast.js";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddHTTPServer, useAddStdioServer } from "../hooks/use-add-server";
import { usePlaybooks } from "../hooks/use-playbooks";
import { useRegistryEntries } from "../hooks/use-registry-entries";

export const RegistryListPage: React.FC = () => {
  const navigate = useNavigate();

  const [pageIndex, setPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const { data: playbooks } = usePlaybooks();
  const { data, isLoading, error } = useRegistryEntries({
    pageIndex,
    pageSize: 20,
    searchQuery,
  });

  const onAddSuccess = (playbookId: string) => {
    toast({
      title: "Server added",
      description: "The server has been added to the playbook",
    });
    setAddSheetOpen(false);
    navigate(`/${playbookId}`);
  };

  const onAddError = () => {
    toast({
      title: "Failed to add server",
      description: "Please check Director CLI logs for more information.",
    });
  };

  const { addHTTPServer, isPending: isHTTPPending } = useAddHTTPServer({
    onSuccess: (_data, variables) => onAddSuccess(variables.playbookId),
    onError: onAddError,
  });

  const { addStdioServer, isPending: isStdioPending } = useAddStdioServer({
    onSuccess: (_data, variables) => onAddSuccess(variables.playbookId),
    onError: onAddError,
  });

  const isPending = isHTTPPending || isStdioPending;

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

        <PlaybookTargetAddSheet
          open={addSheetOpen}
          onOpenChange={setAddSheetOpen}
          playbooks={playbooks}
          onSubmit={async (data: PlaybookTargetFormData) => {
            if (!data.playbookId) {
              toast({
                title: "No playbook selected",
                description: "Please select a playbook before adding a server.",
              });
              return;
            }

            if (data.server.type === "http") {
              await addHTTPServer({
                playbookId: data.playbookId,
                name: data.server.name,
                url: data.server.url,
                headers: data.server.headers,
              });
            } else {
              await addStdioServer({
                playbookId: data.playbookId,
                name: data.server.name,
                command: data.server.command,
                args: data.server.args,
                env: data.server.env,
              });
            }
          }}
          isSubmitting={isPending}
        />
      </LayoutViewContent>
    </LayoutView>
  );
};
