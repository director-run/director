import { LayoutBreadcrumbHeader } from "@director.run/studio/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/studio/components/layout/layout.tsx";
import { useParams } from "react-router-dom";

export function WorkspaceTargetDetailPage() {
  const { workspaceId, targetId } = useParams();

  return (
    <>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: "Details",
          },
        ]}
      />

      <LayoutViewContent>
        <div>
          <h1>
            Workspace Target Detail {targetId} {workspaceId}
          </h1>
        </div>
      </LayoutViewContent>
    </>
  );
}
