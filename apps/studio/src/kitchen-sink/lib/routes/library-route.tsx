import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import {
  LayoutView,
  LayoutViewContent,
} from "@director.run/design/components/layout/layout.tsx";
import { PlaybookTargetAddSheet } from "@director.run/design/components/mcp-servers/mcp-add-sheet.tsx";
import { RegistryItemList } from "@director.run/design/components/pages/registry-item-list.tsx";
import { RegistryLibrarySkeleton } from "@director.run/design/components/registry/registry-library-skeleton.tsx";
import type { PlaybookDetail } from "@director.run/design/components/types.ts";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@director.run/design/components/ui/empty-state.tsx";
import { toast } from "@director.run/design/components/ui/toast.tsx";
import { mockRegistryEntryList } from "@director.run/design/test/fixtures/registry/entry-list.ts";
import { useState } from "react";
import type { KitchenSinkNavigate, KitchenSinkPageState } from "../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const PAGE_SIZE = 6;

interface LibraryRouteProps {
  playbooks: PlaybookDetail[];
  navigate: KitchenSinkNavigate;
  pageState: KitchenSinkPageState;
  initialSearchQuery?: string;
}

export function LibraryRoute({
  playbooks,
  navigate,
  pageState,
  initialSearchQuery = "",
}: LibraryRouteProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (pageState === "loading") {
    return <RegistryLibrarySkeleton />;
  }

  if (pageState === "error") {
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

  const query = searchQuery.trim().toLowerCase();
  const filtered = query
    ? mockRegistryEntryList.filter((entry) =>
        `${entry.title} ${entry.name} ${entry.description}`
          .toLowerCase()
          .includes(query),
      )
    : mockRegistryEntryList;

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const pageEntries = filtered.slice(
    safePageIndex * PAGE_SIZE,
    safePageIndex * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <LayoutView>
      <LayoutBreadcrumbHeader breadcrumbs={[{ title: "Library" }]} />

      <LayoutViewContent>
        <RegistryItemList
          entries={pageEntries}
          pagination={{
            pageIndex: safePageIndex,
            totalPages,
            totalItems,
            hasPreviousPage: safePageIndex > 0,
            hasNextPage: safePageIndex < totalPages - 1,
          }}
          searchQuery={searchQuery}
          onSearchQueryChange={(value) => {
            setSearchQuery(value);
            setPageIndex(0);
          }}
          onPageChange={setPageIndex}
          onManualAddClick={() => setAddSheetOpen(true)}
          onEntryClick={(entryName) =>
            navigate({ name: "library-entry", entryName })
          }
        />

        <PlaybookTargetAddSheet
          open={addSheetOpen}
          onOpenChange={setAddSheetOpen}
          playbooks={playbooks.map((playbook) => ({
            id: playbook.id,
            name: playbook.name,
          }))}
          isSubmitting={isSubmitting}
          onSubmit={async (data) => {
            if (!data.playbookId) {
              toast({
                title: "No playbook selected",
                description: "Please select a playbook before adding a server.",
              });
              return;
            }
            setIsSubmitting(true);
            await delay(600);
            setIsSubmitting(false);
            setAddSheetOpen(false);
            toast({
              title: "Server added",
              description: "The server has been added to the playbook.",
            });
            navigate({ name: "playbook", playbookId: data.playbookId });
          }}
        />
      </LayoutViewContent>
    </LayoutView>
  );
}
