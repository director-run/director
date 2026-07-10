import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import {
  LayoutView,
  LayoutViewContent,
} from "@director.run/design/components/layout/layout.tsx";
import { RegistryDetailSidebar } from "@director.run/design/components/registry-detail-sidebar.tsx";
import { RegistryItem } from "@director.run/design/components/registry-item.tsx";
import { RegistryEntrySkeleton } from "@director.run/design/components/registry/registry-entry-skeleton.tsx";
import { RegistryInstallForm } from "@director.run/design/components/registry/registry-install-form.tsx";
import {
  SplitView,
  SplitViewMain,
  SplitViewSide,
} from "@director.run/design/components/split-view.tsx";
import type {
  PlaybookDetail,
  RegistryEntryDetail,
} from "@director.run/design/components/types.ts";
import { Button } from "@director.run/design/components/ui/button.tsx";
import { Container } from "@director.run/design/components/ui/container.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@director.run/design/components/ui/popover.tsx";
import { toast } from "@director.run/design/components/ui/toast.tsx";
import { mockRegistryEntryList } from "@director.run/design/test/fixtures/registry/entry-list.ts";
import { mockRegistryEntry } from "@director.run/design/test/fixtures/registry/entry.ts";
import { useState } from "react";
import { delay } from "../fixtures";
import type { KitchenSinkNavigate, KitchenSinkPageState } from "../types";

interface LibraryEntryRouteProps {
  entryName: string;
  playbooks: PlaybookDetail[];
  navigate: KitchenSinkNavigate;
  pageState: KitchenSinkPageState;
}

export function LibraryEntryRoute({
  entryName,
  playbooks,
  navigate,
  pageState,
}: LibraryEntryRouteProps) {
  const [installFormOpen, setInstallFormOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (pageState === "loading") {
    return <RegistryEntrySkeleton />;
  }

  const listEntry = mockRegistryEntryList.find(
    (entry) => entry.name === entryName,
  );
  const entry: RegistryEntryDetail = listEntry
    ? {
        ...mockRegistryEntry,
        name: listEntry.name,
        title: listEntry.title,
        description: listEntry.description,
        icon: listEntry.icon,
        homepage: listEntry.homepage,
      }
    : mockRegistryEntry;

  const handleInstall = async (values: {
    playbookId?: string;
    parameters?: Record<string, string>;
  }) => {
    setIsInstalling(true);
    await delay(600);
    setIsInstalling(false);
    setInstallFormOpen(false);
    toast({
      title: "Playbook installed",
      description: `${entry.title} was added to your playbook.`,
    });
    if (values.playbookId) {
      navigate({ name: "playbook", playbookId: values.playbookId });
    }
  };

  return (
    <LayoutView>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          { title: "Library", onClick: () => navigate({ name: "library" }) },
          { title: entry.title },
        ]}
      >
        <Popover open={installFormOpen} onOpenChange={setInstallFormOpen}>
          <PopoverTrigger asChild>
            <Button className="ml-auto lg:hidden">Add to playbook</Button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="end"
            sideOffset={8}
            className="w-sm max-w-[80dvw] rounded-[20px] lg:hidden"
          >
            <RegistryInstallForm
              registryEntry={entry}
              playbooks={playbooks}
              onSubmit={handleInstall}
              isSubmitting={isInstalling}
            />
          </PopoverContent>
        </Popover>
      </LayoutBreadcrumbHeader>

      <LayoutViewContent>
        <Container size="xl">
          <SplitView>
            <SplitViewMain>
              <RegistryItem entry={entry} />
            </SplitViewMain>
            <SplitViewSide>
              <RegistryDetailSidebar
                entry={entry}
                playbooks={playbooks}
                onClickInstall={handleInstall}
                isInstalling={isInstalling}
              />
            </SplitViewSide>
          </SplitView>
        </Container>
      </LayoutViewContent>
    </LayoutView>
  );
}
