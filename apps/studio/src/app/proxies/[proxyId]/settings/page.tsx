"use client";

import { ProxyDeleteConfirmation } from "@/components/proxies/proxy-delete-confirmation";
import { UpdateProxyForm } from "@/components/proxies/proxy-form";
import { Container } from "@/components/ui/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import { trpc } from "@/trpc/client";
import { useParams } from "next/navigation";

export default function ProxySettingsPage() {
  const params = useParams<{ proxyId: string }>();

  const { data, isLoading, isError } = trpc.store.get.useQuery({
    proxyId: params.proxyId,
  });

  if (isLoading) {
    return (
      <div>
        <div>Loading…</div>
      </div>
    );
  }

  if (isError || !data) {
    // TODO: Add 404
    return <div>Not found</div>;
  }

  return (
    <Container className="py-12">
      <div className="flex w-full flex-col gap-y-8">
        <Section>
          <SectionHeader>
            <SectionTitle>Settings</SectionTitle>
          </SectionHeader>
        </Section>

        <SectionSeparator />

        <Section>
          <SectionHeader>
            <SectionTitle className="leading-7" variant="h2" asChild>
              <h2>General</h2>
            </SectionTitle>
            <SectionDescription>
              Update the name and description of the proxy.
            </SectionDescription>
          </SectionHeader>

          <UpdateProxyForm {...data} />
        </Section>

        <SectionSeparator />

        <Section>
          <SectionHeader>
            <SectionTitle className="leading-7" variant="h2" asChild>
              <h2>Danger zone</h2>
            </SectionTitle>
            <SectionDescription>
              All actions require confirmation and are irreversible.
            </SectionDescription>
          </SectionHeader>

          <ProxyDeleteConfirmation proxyId={data.id} />
        </Section>
      </div>
    </Container>
  );
}
