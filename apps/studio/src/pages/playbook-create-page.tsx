import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { PlaybookCreate } from "@director.run/design/components/pages/playbook-new.tsx";
import type { PlaybookFormData } from "@director.run/design/components/playbooks/playbook-form.tsx";
import { toast } from "@director.run/design/components/ui/toast.tsx";
import { useNavigate } from "react-router-dom";
import { useCreatePlaybook } from "../hooks/use-create-playbook";

export function PlaybookCreatePage() {
  const navigate = useNavigate();

  const { createPlaybook, isPending } = useCreatePlaybook({
    onSuccess: (response) => {
      toast({
        title: "Playbook created",
        description: "This playbook was successfully created.",
      });
      navigate(`/${response.id}`);
    },
  });

  const handleSubmit = async (values: PlaybookFormData) => {
    await createPlaybook(values);
  };

  return (
    <>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: "New Playbooks",
          },
        ]}
      />

      <LayoutViewContent>
        <PlaybookCreate onSubmit={handleSubmit} isSubmitting={isPending} />
      </LayoutViewContent>
    </>
  );
}
