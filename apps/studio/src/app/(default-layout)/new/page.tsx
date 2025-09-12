"use client";

import { LayoutView, LayoutViewContent } from "@/components/layout/layout";
import {
  ProxyForm,
  ProxyFormButton,
  ProxyFormData,
} from "@/components/proxies/proxy-form";
import { Container } from "@/components/ui/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import { toast } from "@/components/ui/toast";
import { trpc } from "@/state/client";
import { useRouter } from "next/navigation";

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
