import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { LayoutView } from "@director.run/design/components/layout/layout.tsx";
import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";
import { ProxySkeleton } from "@director.run/design/components/proxies/proxy-skeleton.tsx";
import type { MCPTool } from "@director.run/design/components/types.js";
import { WorkspaceTargetDetailContent } from "@director.run/design/components/workspaces/workspace-target-detail-content.tsx";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useInspectMcp } from "../hooks/use-inspect-mcp.ts";
import { useRegistryEntry } from "../hooks/use-registry-entry.ts";
import { useWorkspaceTarget } from "../hooks/use-workspace-target.ts";
import { WorkspaceTargetDetailDropDownMenu } from "./workspace-target-detail-dropdown-menu.tsx";

export function WorkspaceTargetDetailPage() {
  const { workspaceId, targetId } = useParams();
  const navigate = useNavigate();

  if (!workspaceId || !targetId) {
    throw new Error("Workspace ID and target ID are required");
  }

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
  const registryEntry = registryEntryQuery.data;

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
          workspaceTarget={workspaceTarget}
          workspace={workspace}
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
