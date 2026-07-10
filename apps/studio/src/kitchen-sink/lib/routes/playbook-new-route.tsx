import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { PlaybookCreate } from "@director.run/design/components/pages/playbook-new.tsx";
import type { PlaybookFormData } from "@director.run/design/components/playbooks/playbook-form.tsx";
import { toast } from "@director.run/design/components/ui/toast.tsx";
import { useState } from "react";
import { delay } from "../fixtures";

interface PlaybookNewRouteProps {
  onCreate: (values: { name: string; description?: string }) => void;
}

export function PlaybookNewRoute({ onCreate }: PlaybookNewRouteProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: PlaybookFormData) => {
    setIsSubmitting(true);
    await delay(500);
    setIsSubmitting(false);
    toast({
      title: "Playbook created",
      description: "This playbook was successfully created.",
    });
    onCreate(values);
  };

  return (
    <>
      <LayoutBreadcrumbHeader breadcrumbs={[{ title: "New Playbooks" }]} />
      <LayoutViewContent>
        <PlaybookCreate onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </LayoutViewContent>
    </>
  );
}
