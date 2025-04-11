"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Container } from "@/components/container";
import { ProxyForm } from "@/components/proxy/proxy-form";
import {
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/section";
import { Section } from "@/components/section";
import { trpc } from "@/lib/trpc";

export default function ProxyNewPage() {
  const router = useRouter();

  const createServerMutation = trpc.store.create.useMutation();
  const utils = trpc.useUtils();

  return (
    <Container size="sm">
      <Section>
        <SectionHeader>
          <SectionTitle>Create your first server</SectionTitle>
          <SectionDescription className="max-w-[50ch]">
            Servers are the core of Director that allows you to proxy multiple
            MCP servers into one easy-to-use tool.
          </SectionDescription>
        </SectionHeader>

        <ProxyForm
          buttonLabel="Create first server"
          onSubmit={async (values) => {
            const res = await createServerMutation.mutateAsync(values);

            toast("Server created", {
              description: `${res.name} has been created successfully.`,
            });

            await utils.store.getAll.refetch();
            router.push(`/proxy?proxyId=${res.id}`);
          }}
        />
      </Section>
    </Container>
  );
}
