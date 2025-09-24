import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import {
  LayoutView,
  LayoutViewContent,
} from "@director.run/design/components/layout/layout.tsx";
import { RegistryDetailSidebar } from "@director.run/design/components/registry-detail-sidebar.tsx";
import { RegistryItem } from "@director.run/design/components/registry-item.tsx";
import { RegistryEntrySkeleton } from "@director.run/design/components/registry/registry-entry-skeleton.tsx";
import { RegistryInstallForm } from "@director.run/design/components/registry/registry-install-form.tsx";
import { RegistryToolSheet } from "@director.run/design/components/registry/registry-tool-sheet.tsx";
import {
  SplitView,
  SplitViewMain,
  SplitViewSide,
} from "@director.run/design/components/split-view.tsx";
import type { MCPTool } from "@director.run/design/components/types.js";
import { Button } from "@director.run/design/components/ui/button.tsx";
import { Container } from "@director.run/design/components/ui/container.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@director.run/design/components/ui/popover.tsx";
import { toast } from "@director.run/design/components/ui/toast.tsx";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useInstallServerFromRegistry } from "../hooks/use-install-server-from-registry";
import { useRegistryEntry } from "../hooks/use-registry-entry";
import { useWorkspaces } from "../hooks/use-workspaces";

export function RegistryDetailPage() {
  const navigate = useNavigate();

  const { entryName } = useParams<{ entryName: string }>();
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [installFormOpen, setInstallFormOpen] = useState(false);

  const entryQuery = useRegistryEntry({ entryName });
  const storeQuery = useWorkspaces();

  const { install, isPending } = useInstallServerFromRegistry({
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
    onSuccess: (_data, variables) => {
      toast({
        title: "Proxy installed",
        description: "This proxy was successfully installed.",
      });
      navigate(`/${variables.proxyId}`);
    },
  });

  const isLoading = entryQuery.isLoading || storeQuery.isLoading;
  const registryEntry = entryQuery.data;

  const handleInstall = async (values: {
    proxyId?: string;
    parameters?: Record<string, string>;
  }) => {
    if (!registryEntry) {
      return;
    }

    if (values.proxyId && entryName) {
      await install({
        proxyId: values.proxyId,
        entryName,
        parameters: values.parameters ?? {},
      });
    }
  };

  useEffect(() => {
    if (!isLoading && !registryEntry) {
      toast({
        title: "Library entry not found",
        description: "The library entry you are looking for does not exist.",
      });
      navigate("/library");
    }
  }, [registryEntry, isLoading, navigate]);

  if (isLoading || !registryEntry) {
    return <RegistryEntrySkeleton />;
  }

  const workspaces = storeQuery.data ?? [];

  return (
    <LayoutView>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: "Library",
            onClick: () => navigate("/library"),
          },
          {
            title: registryEntry.title,
          },
        ]}
      >
        <Popover open={installFormOpen} onOpenChange={setInstallFormOpen}>
          <PopoverTrigger asChild>
            <Button className="ml-auto lg:hidden">Add to proxy</Button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="end"
            sideOffset={8}
            className="w-sm max-w-[80dvw] rounded-[20px] lg:hidden"
          >
            <RegistryInstallForm
              registryEntry={registryEntry}
              proxies={workspaces}
              onSubmit={handleInstall}
              isSubmitting={isPending}
            />
          </PopoverContent>
        </Popover>
      </LayoutBreadcrumbHeader>

      <LayoutViewContent>
        <Container size="xl">
          <SplitView>
            <SplitViewMain>
              <RegistryItem
                entry={registryEntry}
                onToolClick={(tool) => setSelectedTool(tool)}
              />
            </SplitViewMain>
            <SplitViewSide>
              <RegistryDetailSidebar
                entry={registryEntry}
                proxies={workspaces}
                onClickInstall={handleInstall}
                isInstalling={isPending}
              />
            </SplitViewSide>
          </SplitView>
        </Container>

        {selectedTool && (
          <RegistryToolSheet
            tool={selectedTool}
            mcpName={registryEntry.title}
            onClose={() => setSelectedTool(null)}
          />
        )}
      </LayoutViewContent>
    </LayoutView>
  );
}
