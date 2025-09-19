import { LayoutBreadcrumbHeader } from "@director.run/studio/components/layout/layout-breadcrumb-header.js";
import { LayoutViewContent } from "@director.run/studio/components/layout/layout.js";
import { WorkspaceDetail } from "@director.run/studio/components/pages/workspace-detail.tsx";
import { useParams } from "react-router";
import { useWorkspace } from "../hooks/use-workspace";

export const WorkspaceDetailPage = () => {
  const { workspaceId } = useParams();

  if (!workspaceId) {
    throw new Error("Workspace ID is required");
  }
  const { workspace, isLoading, installers } = useWorkspace(workspaceId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!workspace) {
    return <div>Workspace not found</div>;
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
            console.log(serverId);
          }}
        />
      </LayoutViewContent>
    </>
  );
};
