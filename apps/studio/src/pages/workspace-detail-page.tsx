import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";
import { ProxyActionsDropdown } from "@director.run/design/components/proxies/proxy-actions-dropdown.tsx";
import { ProxyDeleteConfirmation } from "@director.run/design/components/proxies/proxy-delete-confirmation.tsx";
import { ProxySettingsSheet } from "@director.run/design/components/proxies/proxy-settings-sheet.tsx";
import { ProxySkeleton } from "@director.run/design/components/proxies/proxy-skeleton.tsx";
import { WorkspaceSectionClients } from "@director.run/design/components/proxies/workspace-section-clients.tsx";
import { ToolsList } from "@director.run/design/components/tools/tools-list.tsx";
import { ConfiguratorTarget } from "@director.run/design/components/types.ts";
import type { WorkspaceDetail } from "@director.run/design/components/types.ts";
import type { MCPTool } from "@director.run/design/components/types.ts";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { SectionSeparator } from "@director.run/design/components/ui/section.tsx";
import { Section } from "@director.run/design/components/ui/section.tsx";
import { SectionHeader } from "@director.run/design/components/ui/section.tsx";
import { SectionTitle } from "@director.run/design/components/ui/section.tsx";
import { SectionDescription } from "@director.run/design/components/ui/section.tsx";
import { toast } from "@director.run/design/components/ui/toast.js";
import { WorkspaceServerList } from "@director.run/design/components/workspaces/server-list.tsx";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { GATEWAY_URL } from "../config.ts";
import { gatewayClient } from "../contexts/backend-context.tsx";
import { useChangeInstallState } from "../hooks/use-change-install-state.ts";
import { useClients } from "../hooks/use-clients.ts";
import { useInspectMcp } from "../hooks/use-inspect-mcp.ts";
import { useWorkspace } from "../hooks/use-workspace.ts";

export const WorkspaceDetailPage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  if (!workspaceId) {
    throw new Error("Workspace ID is required");
  }

  const { workspace, isWorkspaceLoading, workspaceError } =
    useWorkspace(workspaceId);
  const { tools, isLoading: toolsLoading } = useInspectMcp(workspaceId);
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
          <Section>
            <SectionHeader>
              <SectionTitle>{workspace.name}</SectionTitle>
              <SectionDescription>{workspace.description}</SectionDescription>
            </SectionHeader>
          </Section>
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
          <WorkspaceServerList
            servers={workspace.servers}
            onClickServer={(server) =>
              navigate(`/${workspaceId}/${server.name}`)
            }
            onClickAddServer={() => navigate("/library")}
          />
          <SectionSeparator />
          <ToolsList tools={tools as MCPTool[]} toolsLoading={toolsLoading} />
        </Container>
      </LayoutViewContent>
    </>
  );
};

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
