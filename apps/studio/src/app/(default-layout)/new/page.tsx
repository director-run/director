"use client";

import { LayoutView, LayoutViewContent } from "@/components/layout/layout";
import { LayoutNavigation } from "@/components/layout/navigation";
import { NewProxyForm } from "@/components/proxies/proxy-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import { trpc } from "@/trpc/client";

export default function NewProxyPage() {
  const { data: servers, isLoading, error } = trpc.store.getAll.useQuery();

  return (
    <LayoutView>
      <LayoutNavigation
        servers={servers}
        isLoading={isLoading}
        error={error?.message}
      >
        <Breadcrumb className="grow">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>New proxy</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </LayoutNavigation>

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
            <NewProxyForm />
          </Section>
        </Container>
      </LayoutViewContent>
    </LayoutView>
  );
}
