import { LayoutBreadcrumbHeader } from "@director.run/studio/components/layout/layout-breadcrumb-header.js";
import { LayoutViewContent } from "@director.run/studio/components/layout/layout.js";
import { useParams } from "react-router";

export const WorkspaceDetailPage = () => {
  const { workspaceId } = useParams();

  if (!workspaceId) {
    throw new Error("Workspace ID is required");
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
        I am a workspace detail page {workspaceId}
        {/* <WorkspaceDetail onSubmit={handleSubmit} isSubmitting={mutation.isPending} /> */}
      </LayoutViewContent>
    </>
  );
};
