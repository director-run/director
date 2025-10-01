import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { WorkspaceCreate } from "@director.run/design/components/pages/workspace-new.tsx";
import type { ProxyFormData } from "@director.run/design/components/proxies/proxy-form.tsx";
import { toast } from "@director.run/design/components/ui/toast.tsx";
import { useNavigate } from "react-router-dom";
import { useCreateProxy } from "../hooks/use-create-proxy";

export function WorkspaceCreatePage() {
  const navigate = useNavigate();

  const { createProxy, isPending } = useCreateProxy({
    onSuccess: (response) => {
      toast({
        title: "Workspace created",
        description: "This workpace was successfully created.",
      });
      navigate(`/${response.id}`);
    },
  });

  const handleSubmit = async (values: ProxyFormData) => {
    await createProxy({ ...values, servers: [] });
  };

  return (
    <>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: "New Workspace",
          },
        ]}
      />

      <LayoutViewContent>
        <WorkspaceCreate onSubmit={handleSubmit} isSubmitting={isPending} />
      </LayoutViewContent>
    </>
  );
}
