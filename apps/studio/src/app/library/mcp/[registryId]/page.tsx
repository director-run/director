"use client";

import {
  LayoutView,
  LayoutViewContent,
  LayoutViewHeader,
} from "@/components/layout";
import { McpDescriptionList } from "@/components/mcp-servers/mcp-description-list";
import { RegistryEntrySkeleton } from "@/components/registry/registry-entry-skeleton";
import { RegistryInstallDialog } from "@/components/registry/registry-install-dialog";
import { RegistryParameters } from "@/components/registry/registry-parameters";
import { RegistryToolSheet } from "@/components/registry/registry-tool-sheet";
import { RegistryTools } from "@/components/registry/registry-tools";
import {
  Badge,
  BadgeGroup,
  BadgeIcon,
  BadgeLabel,
} from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import { useRegistryQuery } from "@/hooks/use-registry-query";
import { trpc } from "@/trpc/client";
import {
  FileCodeIcon,
  GlobeIcon,
  LinkIcon,
  PackageIcon,
  SealCheckIcon,
  TerminalIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function RegistryEntryPage() {
  const { registryId } = useParams<{ registryId: string }>();
  const { toolId } = useRegistryQuery();
  const [{ data, isLoading, error }, store] = trpc.useQueries((t) => [
    t.registry.getEntryByName({
      name: registryId,
    }),
    t.store.getAll(),
  ]);

  if (isLoading || store.isLoading) {
    return <RegistryEntrySkeleton />;
  }

  if (!data || error || store.error) {
    return (
      <RegistryEntrySkeleton>
        <div className="absolute inset-0 grid place-items-center">
          <EmptyState>
            <EmptyStateTitle>Something went wrong.</EmptyStateTitle>
            <EmptyStateDescription>Please try again</EmptyStateDescription>
          </EmptyState>
        </div>
      </RegistryEntrySkeleton>
    );
  }

  const selectedTool = data.tools?.find((tool) => tool.name === toolId);

  return (
    <LayoutView>
      <LayoutViewHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/library">Library</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{data.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <RegistryInstallDialog mcp={data} proxies={store.data ?? []}>
          <Button className="ml-auto">Add to proxy</Button>
        </RegistryInstallDialog>
      </LayoutViewHeader>

      <LayoutViewContent>
        <Container size="lg">
          <Section className="gap-y-6">
            <SectionHeader>
              <SectionTitle>{data.title}</SectionTitle>
              <SectionDescription>{data.description}</SectionDescription>
            </SectionHeader>

            <BadgeGroup>
              {data.isOfficial && (
                <Badge variant="success">
                  <BadgeIcon>
                    <SealCheckIcon />
                  </BadgeIcon>
                  <BadgeLabel uppercase>Official</BadgeLabel>
                </Badge>
              )}
              {data.transport.type === "http" && (
                <Badge>
                  <BadgeIcon>
                    <GlobeIcon />
                  </BadgeIcon>
                  <BadgeLabel uppercase>HTTP</BadgeLabel>
                </Badge>
              )}
              {data.transport.type === "stdio" && (
                <Badge>
                  <BadgeIcon>
                    <TerminalIcon />
                  </BadgeIcon>
                  <BadgeLabel uppercase>STDIO</BadgeLabel>
                </Badge>
              )}

              {data.transport.type === "stdio" && (
                <Badge>
                  <BadgeIcon>
                    {(() => {
                      switch (data.transport.command) {
                        case "docker":
                          return <PackageIcon />;
                        default:
                          return <FileCodeIcon />;
                      }
                    })()}
                  </BadgeIcon>
                  <BadgeLabel uppercase>{data.transport.command}</BadgeLabel>
                </Badge>
              )}

              {data.homepage && (
                <Badge
                  className="ml-auto transition-opacity duration-200 hover:opacity-50"
                  asChild
                >
                  <a
                    href={data.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BadgeIcon>
                      <LinkIcon weight="bold" />
                    </BadgeIcon>
                    <BadgeLabel uppercase>Homepage</BadgeLabel>
                  </a>
                </Badge>
              )}
            </BadgeGroup>
          </Section>

          <SectionSeparator />

          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h3>Transport</h3>
              </SectionTitle>
            </SectionHeader>
            <McpDescriptionList transport={data.transport} />
          </Section>

          <SectionSeparator />

          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h3>Parameters</h3>
              </SectionTitle>
            </SectionHeader>
            <RegistryParameters parameters={data.parameters ?? []} />
          </Section>

          <SectionSeparator />

          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h3>Tools</h3>
              </SectionTitle>
            </SectionHeader>
            <RegistryTools tools={data.tools ?? []} />
          </Section>
        </Container>
      </LayoutViewContent>

      <RegistryToolSheet
        tool={selectedTool}
        mcpName={data.title}
        mcpId={data.name}
      />
    </LayoutView>
  );
}
