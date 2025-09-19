"use client";

import { LayoutBreadcrumbHeader } from "@director.run/studio/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/studio/components/layout/layout.tsx";
import { ProxyNew } from "@director.run/studio/components/pages/proxy-new.tsx";
import type { ProxyFormData } from "@director.run/studio/components/proxies/proxy-form.tsx";
import { toast } from "@director.run/studio/components/ui/toast.tsx";
import { useNavigate } from "react-router-dom";
import { trpc } from "../contexts/gateway-context";

export function NewProxyPage() {
  const navigate = useNavigate();

  const utils = trpc.useUtils();
  const mutation = trpc.store.create.useMutation({
    onSuccess: async (response) => {
      await utils.store.getAll.refetch();
      toast({
        title: "Proxy created",
        description: "This proxy was successfully created.",
      });
      navigate(`/${response.id}`);
    },
  });

  const handleSubmit = async (values: ProxyFormData) => {
    await mutation.mutateAsync({ ...values, servers: [] });
  };

  return (
    <>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: "New proxy",
          },
        ]}
      />

      <LayoutViewContent>
        <ProxyNew onSubmit={handleSubmit} isSubmitting={mutation.isPending} />
      </LayoutViewContent>
    </>
  );
}
