"use client";

import { ConfiguratorTarget } from "@director.run/client-configurator/index";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutView,
  LayoutViewContent,
} from "../../../components/layout/layout";
import { LayoutBreadcrumbHeader } from "../../../components/layout/layout-breadcrumb-header";
import { ProxyActionsDropdown } from "../../../components/proxies/proxy-actions-dropdown";
import { ProxyDeleteConfirmation } from "../../../components/proxies/proxy-delete-confirmation";
import { ProxySettingsSheet } from "../../../components/proxies/proxy-settings-sheet";
import { ProxySkeleton } from "../../../components/proxies/proxy-skeleton";
import { WorkspaceSectionClients } from "../../../components/proxies/workspace-section-clients";
import { WorkspaceSectionHeader } from "../../../components/proxies/workspace-section-header";
import { WorkspaceSectionServers } from "../../../components/proxies/workspace-section-servers";
import { WorkspaceSectionTools } from "../../../components/proxies/workspace-section-tools";
import { RegistryToolSheet } from "../../../components/registry/registry-tool-sheet";
import type { MCPTool } from "../../../components/types";
import { Container } from "../../../components/ui/container";
import { SectionSeparator } from "../../../components/ui/section";
import { toast } from "../../../components/ui/toast";
import { DIRECTOR_URL } from "../../../config";
import { useChangeInstallState } from "../../../hooks/use-change-install-state";
import { useClients } from "../../../hooks/use-clients";
import { trpc } from "../../../state/client";
import { useInspectMcp } from "../../../state/use-inspect-mcp";
import { useProxy } from "../../../state/use-proxy";

export default function ProxyPage() {
  const router = useRouter();
  const params = useParams<{ proxyId: string }>();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { changeInstallState, isPending } = useChangeInstallState(
    params.proxyId,
    {
      onSuccess: (_client, install) => {
        toast({
          title: install ? "Proxy installed" : "Proxy uninstalled",
          description: install
            ? "This proxy was successfully installed"
            : "This proxy was successfully uninstalled",
        });
      },
      onError: (_client, install) => {
        toast({
          title: "Error",
          description: install
            ? "Failed to install this proxy"
            : "Failed to uninstall this proxy",
        });
      },
    },
  );

  const { proxy: workspace, isLoading } = useProxy(params.proxyId);
  const { data: clients, isLoading: isClientsLoading } = useClients(
    params.proxyId,
  );
  const { tools, isLoading: toolsLoading } = useInspectMcp(params.proxyId);
  const utils = trpc.useUtils();

  const updateProxyMutation = trpc.store.update.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.invalidate();
      await utils.store.get.invalidate({ proxyId: params.proxyId });
      toast({
        title: "Proxy updated",
        description: "This proxy was successfully updated.",
      });
      router.refresh();
      setSettingsOpen(false);
    },
  });

  const deleteProxyMutation = trpc.store.delete.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.invalidate();
      toast({
        title: "Proxy deleted",
        description: "This proxy was successfully deleted.",
      });
      setDeleteOpen(false);
      router.push("/");
    },
  });

  const handleUpdateProxy = async (values: {
    name: string;
    description?: string;
  }) => {
    await updateProxyMutation.mutateAsync({
      proxyId: params.proxyId,
      attributes: values,
    });
  };

  const handleDeleteProxy = async () => {
    await deleteProxyMutation.mutateAsync({ proxyId: params.proxyId });
  };

  const handleServerClick = (serverId: string) => {
    router.push(`/${params.proxyId}/mcp/${serverId}`);
  };

  useEffect(() => {
    if (!isLoading && !workspace) {
      toast({
        title: "Proxy not found",
        description: "The proxy you are looking for does not exist.",
      });
      router.push("/");
    }
  }, [workspace, isLoading]);

  if (isLoading || !workspace) {
    return <ProxySkeleton />;
  }

  return (
    <LayoutView>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: workspace.name,
          },
        ]}
      >
        <ProxyActionsDropdown
          onSettingsClick={() => setSettingsOpen(true)}
          onDeleteClick={() => setDeleteOpen(true)}
        />
      </LayoutBreadcrumbHeader>

      <LayoutViewContent>
        <Container size="lg">
          <WorkspaceSectionHeader workspace={workspace} />
          <SectionSeparator />
          <WorkspaceSectionClients
            workspace={workspace}
            gatewayBaseUrl={DIRECTOR_URL}
            clients={clients ?? []}
            isClientsLoading={isClientsLoading}
            onChangeInstall={async (
              client: ConfiguratorTarget,
              install: boolean,
            ) => {
              await changeInstallState(client, install);
            }}
            isChanging={isPending}
          />
          <SectionSeparator />
          <WorkspaceSectionServers
            workspace={workspace}
            onLibraryClick={() => router.push("/library")}
            onServerClick={handleServerClick}
          />
          <SectionSeparator />
          <WorkspaceSectionTools
            tools={tools}
            toolsLoading={toolsLoading}
            onToolClick={(tool) => setSelectedTool(tool)}
          />
        </Container>
      </LayoutViewContent>

      {selectedTool && (
        <RegistryToolSheet
          tool={selectedTool as MCPTool}
          mcpName={workspace.name}
          onClose={() => setSelectedTool(null)}
        />
      )}

      <ProxySettingsSheet
        proxy={workspace}
        onSubmit={handleUpdateProxy}
        isSubmitting={updateProxyMutation.isPending}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />

      <ProxyDeleteConfirmation
        onConfirm={handleDeleteProxy}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </LayoutView>
  );
}
