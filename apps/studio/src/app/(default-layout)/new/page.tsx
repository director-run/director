"use client";

import { useRouter } from "next/navigation";
import {
  LayoutView,
  LayoutViewContent,
  LayoutViewHeader,
} from "../../../components/layout/layout";
import { ProxyNew } from "../../../components/pages/proxy-new";
import type { ProxyFormData } from "../../../components/proxies/proxy-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../../../components/ui/breadcrumb";
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
      <LayoutViewHeader>
        <Breadcrumb className="grow">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>New proxy</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </LayoutViewHeader>

      <LayoutViewContent>
        <ProxyNew
          title="New proxy"
          description="Create a new proxy to start using MCP."
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          submitLabel="Create proxy"
        />
      </LayoutViewContent>
    </LayoutView>
  );
}
