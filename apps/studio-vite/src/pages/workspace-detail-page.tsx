import { LayoutBreadcrumbHeader } from "@director.run/studio/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/studio/components/layout/layout.tsx";
import { FullScreenError } from "@director.run/studio/components/pages/global/error.tsx";
import { ProxyActionsDropdown } from "@director.run/studio/components/proxies/proxy-actions-dropdown.tsx";
import { ProxyDeleteConfirmation } from "@director.run/studio/components/proxies/proxy-delete-confirmation.tsx";
import { ProxySettingsSheet } from "@director.run/studio/components/proxies/proxy-settings-sheet.tsx";
import { ProxySkeleton } from "@director.run/studio/components/proxies/proxy-skeleton.tsx";
import { WorkspaceSectionClients } from "@director.run/studio/components/proxies/workspace-section-clients.tsx";
import { WorkspaceSectionHeader } from "@director.run/studio/components/proxies/workspace-section-header.tsx";
import { WorkspaceSectionServers } from "@director.run/studio/components/proxies/workspace-section-servers.tsx";
import { WorkspaceSectionTools } from "@director.run/studio/components/proxies/workspace-section-tools.tsx";
import { RegistryToolSheet } from "@director.run/studio/components/registry/registry-tool-sheet.js";
import { ConfiguratorTarget } from "@director.run/studio/components/types.ts";
import type {
  MCPTool,
  WorkspaceDetail,
} from "@director.run/studio/components/types.ts";
import { Container } from "@director.run/studio/components/ui/container.tsx";
import { SectionSeparator } from "@director.run/studio/components/ui/section.tsx";
import { toast } from "@director.run/studio/components/ui/toast.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { GATEWAY_URL } from "../config";
import { gatewayClient } from "../contexts/backend-context.tsx";
import { useChangeInstallState } from "../hooks/use-change-install-state";
import { useClients } from "../hooks/use-clients";
import { useInspectMcp } from "../hooks/use-inspect-mcp";
import { useWorkspace } from "../hooks/use-workspace";

export const WorkspaceDetailPage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  if (!workspaceId) {
    throw new Error("Workspace ID is required");
  }

  const { workspace, isWorkspaceLoading, workspaceError } =
    useWorkspace(workspaceId);

  const { data: clients, isLoading: isClientsLoading } =
    useClients(workspaceId);
  const { changeInstallState, isPending } = useChangeInstallState(workspaceId, {
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
  });

  if (isWorkspaceLoading) {
    return <ProxySkeleton />;
  }

  if (workspaceError || !workspace) {
    return (
      <FullScreenError
        icon="dead-smiley"
        fullScreen={true}
        title={"Unexpected Error"}
        subtitle={workspaceError?.message}
      />
    );
  }

  return (
    <>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: "Workspaces",
          },
          {
            title: workspaceId,
          },
        ]}
      >
        <WorkspaceEditMenu workspace={workspace} />
      </LayoutBreadcrumbHeader>

      <LayoutViewContent>
        <Container size="lg">
          <WorkspaceSectionHeader workspace={workspace} />
          <SectionSeparator />
          <WorkspaceSectionClients
            workspace={workspace}
            gatewayBaseUrl={GATEWAY_URL}
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
            onLibraryClick={() => navigate("/library")}
            onServerClick={(serverId) =>
              navigate(`/${workspaceId}/${serverId}`)
            }
          />
          <SectionSeparator />
          <WorkspaceTools workspace={workspace} />
        </Container>
      </LayoutViewContent>
    </>
  );
};

function WorkspaceTools({ workspace }: { workspace: WorkspaceDetail }) {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const { tools, isLoading: toolsLoading } = useInspectMcp(workspace.id);

  return (
    <>
      <WorkspaceSectionTools
        tools={tools}
        toolsLoading={toolsLoading}
        onToolClick={(tool) => setSelectedTool(tool)}
      />

      {selectedTool && (
        <RegistryToolSheet
          tool={selectedTool as MCPTool}
          mcpName={workspace.name}
          onClose={() => setSelectedTool(null)}
        />
      )}
    </>
  );
}

function WorkspaceEditMenu({ workspace }: { workspace: WorkspaceDetail }) {
  const navigate = useNavigate();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const utils = gatewayClient.useUtils();

  const updateProxyMutation = gatewayClient.store.update.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.invalidate();
      await utils.store.get.invalidate({ proxyId: workspace.id });
      toast({
        title: "Proxy updated",
        description: "This proxy was successfully updated.",
      });
      setSettingsOpen(false);
    },
  });

  const deleteProxyMutation = gatewayClient.store.delete.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.invalidate();
      toast({
        title: "Proxy deleted",
        description: "This proxy was successfully deleted.",
      });
      setDeleteOpen(false);
      navigate("/");
    },
  });

  const handleUpdateProxy = async (values: {
    name: string;
    description?: string;
  }) => {
    await updateProxyMutation.mutateAsync({
      proxyId: workspace.id,
      attributes: values,
    });
  };

  const handleDeleteProxy = async () => {
    await deleteProxyMutation.mutateAsync({ proxyId: workspace.id });
  };

  return (
    <>
      <ProxyActionsDropdown
        onSettingsClick={() => setSettingsOpen(true)}
        onDeleteClick={() => setDeleteOpen(true)}
      />
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
    </>
  );
}
