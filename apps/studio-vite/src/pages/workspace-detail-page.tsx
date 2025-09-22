import { LayoutBreadcrumbHeader } from "@director.run/studio/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/studio/components/layout/layout.tsx";
import { WorkspaceDetail } from "@director.run/studio/components/pages/workspace-detail.tsx";
import { ProxySkeleton } from "@director.run/studio/components/proxies/proxy-skeleton.tsx";
import { useNavigate, useParams } from "react-router";
import { useWorkspace } from "../hooks/use-workspace";

export const WorkspaceDetailPage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  if (!workspaceId) {
    throw new Error("Workspace ID is required");
  }

  const { workspace, isLoading, installers } = useWorkspace(workspaceId);

  if (isLoading) {
    return <ProxySkeleton />;
  }

  if (!workspace) {
    throw new Error("Workspace not found");
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
      />

      <LayoutViewContent>
        <WorkspaceDetail
          workspace={workspace}
          gatewayBaseUrl={"http://localhost:3673"}
          clients={[]}
          installers={installers}
          availableClients={[]}
          isClientsLoading={false}
          onInstall={() => {}}
          onUninstall={() => {}}
          isInstalling={false}
          isUninstalling={false}
          toolLinks={[]}
          toolsLoading={false}
          onLibraryClick={() => {}}
          onServerClick={(serverId: string) => {
            navigate(`/${workspaceId}/${serverId}`);
          }}
        />
      </LayoutViewContent>
    </>
  );
};
