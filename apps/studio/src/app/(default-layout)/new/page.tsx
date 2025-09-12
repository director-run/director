"use client";

import {
  LayoutView,
  LayoutViewContent,
  LayoutViewHeader,
} from "@director.run/design/components/layout/layout.tsx";
import {
  ProxyForm,
  ProxyFormButton,
} from "@director.run/design/components/proxies/proxy-form.tsx";
import type { ProxyFormData } from "@director.run/design/components/proxies/proxy-form.tsx";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@director.run/design/components/ui/breadcrumb.tsx";
import { Container } from "@director.run/design/components/ui/container.tsx";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@director.run/design/components/ui/section.tsx";
import { toast } from "@director.run/design/components/ui/toast.tsx";
import { useRouter } from "next/navigation";
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
        <Container size="sm">
          <Section className="gap-y-8">
            <SectionHeader>
              <SectionTitle>New proxy</SectionTitle>
              <SectionDescription>
                Create a new proxy to start using MCP.
              </SectionDescription>
            </SectionHeader>
            <SectionSeparator />
            <ProxyForm
              onSubmit={handleSubmit}
              isSubmitting={mutation.isPending}
            >
              <ProxyFormButton isSubmitting={mutation.isPending}>
                Create proxy
              </ProxyFormButton>
            </ProxyForm>
          </Section>
        </Container>
      </LayoutViewContent>
    </LayoutView>
  );
}
