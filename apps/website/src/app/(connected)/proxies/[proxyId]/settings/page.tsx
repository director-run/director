"use client";

import { notFound } from "next/navigation";

import { useConnectContext } from "@/components/connect/connect-context";
import { UpdateProxyForm } from "@/components/proxies/proxy-form";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";

export default function ProxyShowPage() {
  const { selectedProxy } = useConnectContext();

  if (!selectedProxy) {
    return notFound();
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

          <UpdateProxyForm {...selectedProxy} />
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

          <Button size="large" className="self-start">
            Delete proxy
          </Button>
        </Section>
      </div>
    </Container>
  );
}
