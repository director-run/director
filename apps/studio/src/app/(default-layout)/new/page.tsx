"use client";

import { useRouter } from "next/navigation";
import {
  LayoutView,
  LayoutViewContent,
} from "../../../components/layout/layout";
import { LayoutBreadcrumbHeader } from "../../../components/layout/layout-breadcrumb-header";
import { ProxyNew } from "../../../components/pages/proxy-new";
import type { ProxyFormData } from "../../../components/proxies/proxy-form";
import { toast } from "../../../components/ui/toast";
import { trpc } from "../../../state/client";

export default function NewProxyPage() {
  const router = useRouter();

  const utils = trpc.useUtils();
  const mutation = trpc.store.create.useMutation({
    onSuccess: async (response) => {
      await utils.store.getAll.refetch();
      toast({
        title: "Proxy created",
        description: "This proxy was successfully created.",
      });
      router.push(`/${response.id}`);
    },
  });

  const handleSubmit = async (values: ProxyFormData) => {
    await mutation.mutateAsync({ ...values, servers: [] });
  };

  return (
    <LayoutView>
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
    </LayoutView>
  );
}
