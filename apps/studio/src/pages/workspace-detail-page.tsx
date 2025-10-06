import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";
import { ProxyActionsDropdown } from "@director.run/design/components/proxies/proxy-actions-dropdown.tsx";
import { ProxySettingsSheet } from "@director.run/design/components/proxies/proxy-settings-sheet.tsx";
import { ProxySkeleton } from "@director.run/design/components/proxies/proxy-skeleton.tsx";
import { SplitViewMain } from "@director.run/design/components/split-view.tsx";
import { SplitViewSide } from "@director.run/design/components/split-view.tsx";
import { SplitView } from "@director.run/design/components/split-view.tsx";
import type { WorkspaceDetail } from "@director.run/design/components/types.ts";
import type { MCPTool } from "@director.run/design/components/types.ts";
import { ConfirmDialog } from "@director.run/design/components/ui/confirm-dialog.tsx";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { toast } from "@director.run/design/components/ui/toast.js";
import { WorkspaceDetailContent } from "@director.run/design/components/workspaces/workspace-detail-content.tsx";
import { WorkspaceSectionClients } from "@director.run/design/components/workspaces/workspace-section-clients.tsx";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { GATEWAY_URL } from "../config.ts";
import { gatewayClient } from "../contexts/backend-context.tsx";
import { useAuthenticate } from "../hooks/use-authenticate.ts";
import { useChangeInstallState } from "../hooks/use-change-install-state.ts";
import { useClients } from "../hooks/use-clients.ts";
import { useCreatePrompt } from "../hooks/use-create-prompt.ts";
import { useEditPrompt } from "../hooks/use-edit-prompt.ts";
import { useInspectMcp } from "../hooks/use-inspect-mcp.ts";
import { useWorkspace } from "../hooks/use-workspace.ts";

export const WorkspaceDetailPage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const utils = gatewayClient.useUtils();

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

  const { createPrompt, isPending: isCreatingPrompt } = useCreatePrompt(
    workspaceId,
    {
      onSuccess: async () => {
        await utils.store.get.invalidate({
          proxyId: workspaceId,
        });
        toast({ title: "Prompt saved", description: "Your prompt was saved." });
      },
    },
  );
  const { editPrompt, isPending: isEditingPrompt } = useEditPrompt(
    workspaceId,
    {
      onSuccess: async () => {
        await utils.store.get.invalidate({
          proxyId: workspaceId,
        });
        toast({
          title: "Prompt updated",
          description: "Your prompt was updated.",
        });
      },
    },
  );

  const { authenticate } = useAuthenticate();

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
        <Container size="xl">
          <SplitView>
            <SplitViewMain>
              <WorkspaceDetailContent
                workspace={workspace}
                tools={tools as MCPTool[]}
                toolsLoading={toolsLoading}
                onClickServer={(server) =>
                  navigate(`/${workspaceId}/${server.name}`)
                }
                onClickAddServer={() => navigate("/library")}
                onCreatePrompt={createPrompt}
                onEditPrompt={editPrompt}
                isSavingPrompt={isCreatingPrompt || isEditingPrompt}
                onClickAuthorize={async (server) => {
                  try {
                    await authenticate({
                      proxyId: workspaceId,
                      serverName: server.name,
                    });
                  } catch (error) {
                    toast({
                      title: "Authentication failed",
                      description:
                        error instanceof Error
                          ? error.message
                          : "Unknown error",
                    });
                  }
                }}
              />
            </SplitViewMain>
            <SplitViewSide>
              <WorkspaceSectionClients
                workspace={workspace}
                gatewayBaseUrl={GATEWAY_URL}
                clients={clients ?? []}
                onChangeInstall={changeInstallState}
                isLoading={isPending || isClientsLoading}
              />
            </SplitViewSide>
          </SplitView>
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
      <ConfirmDialog
        title="Delete workspace?"
        description="Are you sure you want to delete this workspace? This action cannot be undone."
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteProxy}
      />
    </>
  );
}
