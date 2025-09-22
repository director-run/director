"use client";

import { LayoutBreadcrumbHeader } from "@director.run/studio/components/layout/layout-breadcrumb-header.tsx";
import {
  LayoutView,
  LayoutViewContent,
} from "@director.run/studio/components/layout/layout.tsx";
import { RegistryDetailSidebar } from "@director.run/studio/components/registry-detail-sidebar.tsx";
import { RegistryItem } from "@director.run/studio/components/registry-item.tsx";
import { RegistryEntrySkeleton } from "@director.run/studio/components/registry/registry-entry-skeleton.tsx";
import { RegistryInstallForm } from "@director.run/studio/components/registry/registry-install-form.tsx";
import { RegistryToolSheet } from "@director.run/studio/components/registry/registry-tool-sheet.tsx";
import {
  SplitView,
  SplitViewMain,
  SplitViewSide,
} from "@director.run/studio/components/split-view.tsx";
import { Button } from "@director.run/studio/components/ui/button.tsx";
import { Container } from "@director.run/studio/components/ui/container.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@director.run/studio/components/ui/popover.tsx";
import { toast } from "@director.run/studio/components/ui/toast.tsx";
import { useCopyToClipboard } from "@director.run/studio/hooks/use-copy-to-clipboard.ts";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { gatewayClient, registryClient } from "../contexts/gateway-context";
import { useRegistryEntry } from "../hooks/use-registry-entry";
import { useWorkspaces } from "../hooks/use-workspaces";

export function RegistryDetailPage() {
  const navigate = useNavigate();

  const { entryName } = useParams<{ entryName: string }>();
  const [toolId, setToolId] = useState<string | null>(null);

  const entryQuery = useRegistryEntry({ entryName });
  const storeQuery = useWorkspaces();

  const [_, copy] = useCopyToClipboard();
  const [installFormOpen, setInstallFormOpen] = useState(false);

  const transportMutation =
    registryClient.entries.getTransportForEntry.useQuery({
      entryName: entryName ?? "",
    });
  const utils = gatewayClient.useUtils();

  const installMutation = gatewayClient.store.addServer.useMutation({
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
    onSuccess: (data, variables) => {
      utils.store.get.invalidate({ proxyId: variables.proxyId });
      utils.store.getAll.invalidate();
      toast({
        title: "Proxy installed",
        description: "This proxy was successfully installed.",
      });
      navigate(`/${variables.proxyId}`);
    },
  });

  const isLoading = entryQuery.isLoading || storeQuery.isLoading;
  const entry = entryQuery.data;

  const handleInstall = async (values: {
    proxyId?: string;
    entryId: string;
    parameters?: Record<string, string>;
  }) => {
    if (!entry) {
      return;
    }

    const transport = await transportMutation.mutateAsync({
      entryName: entry.name,
      parameters: values.parameters ?? {},
    });
    if (values.proxyId) {
      installMutation.mutate({
        proxyId: values.proxyId,
        server: {
          name: entry.name,
          transport,
        },
      });
    }
  };

  const handleCloseTool = () => {
    setToolId(null);
  };

  useEffect(() => {
    if (!isLoading && !entry) {
      toast({
        title: "Library entry not found",
        description: "The library entry you are looking for does not exist.",
      });
      navigate("/library");
    }
  }, [entry, isLoading]);

  if (isLoading || !entry) {
    return <RegistryEntrySkeleton />;
  }

  const selectedTool = entry.tools?.find((tool) => tool.name === toolId);

  const proxies = storeQuery.data ?? [];
  const entryInstalledOn = proxies
    .filter((proxy) => proxy.servers.some((it) => it.name === entry.name))
    .map((p) => p.id);

  const handleToolClick = (toolName: string) => {
    setToolId(toolName);
  };

  return (
    <LayoutView>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: "Library",
            onClick: () => navigate("/library"),
          },
          {
            title: entry.title,
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
              registryEntry={entry}
              proxies={proxies}
              entryInstalledOn={entryInstalledOn}
              onSubmit={handleInstall}
              isSubmitting={installMutation.isPending}
            />
          </PopoverContent>
        </Popover>
      </LayoutBreadcrumbHeader>

      <LayoutViewContent>
        <Container size="xl">
          <SplitView>
            <SplitViewMain>
              <RegistryItem
                entry={entry}
                onToolClick={(tool) => handleToolClick(tool.name)}
              />
            </SplitViewMain>
            <SplitViewSide>
              <RegistryDetailSidebar
                entry={entry}
                proxies={proxies}
                entryInstalledOn={entryInstalledOn}
                onClickInstall={handleInstall}
                isInstalling={installMutation.isPending}
              />
            </SplitViewSide>
          </SplitView>
        </Container>

        {selectedTool && (
          <RegistryToolSheet
            tool={selectedTool}
            mcpName={entry.title}
            onClose={handleCloseTool}
          />
        )}
      </LayoutViewContent>
    </LayoutView>
  );
}
