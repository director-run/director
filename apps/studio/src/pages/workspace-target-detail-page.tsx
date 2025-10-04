import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { LayoutView } from "@director.run/design/components/layout/layout.tsx";
import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";
import { ProxySkeleton } from "@director.run/design/components/proxies/proxy-skeleton.tsx";
import { WorkspaceTargetDetailDropDownMenu } from "@director.run/design/components/proxies/workspace-target-detail-dropdown-menu.tsx";
import type { MCPTool } from "@director.run/design/components/types.js";
import { toast } from "@director.run/design/components/ui/toast.tsx";
import { WorkspaceTargetDetailContent } from "@director.run/design/components/workspaces/workspace-target-detail-content.tsx";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { gatewayClient } from "../contexts/backend-context.tsx";
import { useInspectMcp } from "../hooks/use-inspect-mcp.ts";
import { useRegistryEntry } from "../hooks/use-registry-entry.ts";
import { useWorkspaceTarget } from "../hooks/use-workspace-target.ts";

export function WorkspaceTargetDetailPage() {
  const { workspaceId, targetId } = useParams();
  const navigate = useNavigate();

  if (!workspaceId || !targetId) {
    throw new Error("Workspace ID and target ID are required");
  }

  const [deleteOpen, setDeleteOpen] = useState(false);
  const {
    workspace,
    workspaceTarget,
    isWorkspaceTargetLoading,
    workspaceTargetError,
  } = useWorkspaceTarget(workspaceId, targetId);

  const { tools, isLoading: toolsLoading } = useInspectMcp(
    workspaceId,
    targetId,
  );

  const registryEntryQuery = useRegistryEntry({ entryName: targetId });

  const utils = gatewayClient.useUtils();
  const registryEntry = registryEntryQuery.data;

  const deleteServerMutation = gatewayClient.store.removeServer.useMutation({
    onSuccess: async () => {
      navigate(`/${workspaceId}`);

      await utils.store.get.invalidate({ proxyId: workspaceId });
      await utils.store.getAll.invalidate();

      toast({
        title: "Server deleted",
        description: "This server was successfully deleted.",
      });
    },
  });

  const handleDeleteServer = async () => {
    await deleteServerMutation.mutateAsync({
      proxyId: workspaceId,
      serverName: targetId,
    });
  };

  if (isWorkspaceTargetLoading) {
    return <ProxySkeleton />;
  }

  if (workspaceTargetError || !workspaceTarget || !workspace) {
    return (
      <FullScreenError
        icon="dead-smiley"
        fullScreen={true}
        title={"Unexpected Error"}
        subtitle={workspaceTargetError?.toString() || "Unknown error"}
      />
    );
  }

  return (
    <LayoutView>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: workspace?.name || "",
            onClick: () => navigate(`/${workspaceId}`),
          },
          {
            title: workspaceTarget?.name,
          },
        ]}
      >
        <WorkspaceTargetDetailDropDownMenu
          onDelete={handleDeleteServer}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      </LayoutBreadcrumbHeader>

      <LayoutViewContent>
        <WorkspaceTargetDetailContent
          workspaceTarget={workspaceTarget}
          workspace={workspace}
          registryEntry={registryEntry}
          navigate={navigate}
          workspaceId={workspaceId}
          tools={tools as MCPTool[]}
          toolsLoading={toolsLoading}
        />
      </LayoutViewContent>
    </LayoutView>
  );
}
