import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { PlaybookCreate } from "@director.run/design/components/pages/playbook-new.tsx";
import type { PlaybookFormData } from "@director.run/design/components/playbooks/playbook-form.tsx";
import { toast } from "@director.run/design/components/ui/toast.tsx";
import { useNavigate } from "react-router-dom";
import { useCreatePlaybook } from "../hooks/use-create-playbook";

export function WorkspaceCreatePage() {
  const navigate = useNavigate();

  const { createProxy, isPending } = useCreatePlaybook({
    onSuccess: (response) => {
      toast({
        title: "Workspace created",
        description: "This workpace was successfully created.",
      });
      navigate(`/${response.id}`);
    },
  });

  const handleSubmit = async (values: PlaybookFormData) => {
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
        <PlaybookCreate onSubmit={handleSubmit} isSubmitting={isPending} />
      </LayoutViewContent>
    </>
  );
}
