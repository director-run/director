"use client";

import {
  LayoutView,
  LayoutViewContent,
  LayoutViewHeader,
} from "@/components/layout";
import { McpLogo } from "@/components/mcp-logo";
import { McpDescriptionList } from "@/components/mcp-servers/mcp-description-list";
import { RegistryEntrySkeleton } from "@/components/registry/registry-entry-skeleton";
import { RegistryInstallForm } from "@/components/registry/registry-install-form";
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
import { Container } from "@/components/ui/container";
import { EmptyState, EmptyStateTitle } from "@/components/ui/empty-state";
import { Markdown } from "@/components/ui/markdown";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { useRegistryQuery } from "@/hooks/use-registry-query";
import { trpc } from "@/trpc/client";
import {
  ArrowSquareOutIcon,
  BookOpenTextIcon,
  HardDriveIcon,
  SealCheckIcon,
  ToolboxIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegistryEntryPage() {
  const router = useRouter();
  const { registryId } = useParams<{ registryId: string }>();
  const { toolId } = useRegistryQuery();
  const [entryQuery, storeQuery] = trpc.useQueries((t) => [
    t.registry.getEntryByName({
      name: registryId,
    }),
    t.store.getAll(),
  ]);

  const isLoading = entryQuery.isLoading || storeQuery.isLoading;
  const entry = entryQuery.data;

  useEffect(() => {
    if (!isLoading && !entry) {
      toast({
        title: "Library entry not found",
        description: "The library entry you are looking for does not exist.",
      });
      router.push("/library");
    }
  }, [entry, isLoading]);

  if (isLoading || !entry) {
    return <RegistryEntrySkeleton />;
  }

  const selectedTool = entry.tools?.find((tool) => tool.name === toolId);

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
              <BreadcrumbPage>{entry.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </LayoutViewHeader>

      <LayoutViewContent>
        <Container size="xl">
          <div className="flex flex-row gap-x-8">
            <div className="flex min-w-0 grow flex-col gap-y-12 lg:gap-y-16">
              <Section className="gap-y-8">
                <McpLogo
                  src={entry.icon}
                  fallback={entry.name.charAt(0).toUpperCase()}
                  className="size-9"
                />
                <SectionHeader>
                  <SectionTitle>{entry.title}</SectionTitle>
                  <SectionDescription>{entry.description}</SectionDescription>
                </SectionHeader>

                <BadgeGroup>
                  {entry.isOfficial && (
                    <Badge variant="success">
                      <BadgeIcon>
                        <SealCheckIcon />
                      </BadgeIcon>
                      <BadgeLabel uppercase>Official</BadgeLabel>
                    </Badge>
                  )}

                  {entry.homepage && (
                    <Badge
                      className="transition-opacity duration-200 hover:opacity-50"
                      asChild
                    >
                      <a
                        href={entry.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <BadgeIcon>
                          <ArrowSquareOutIcon weight="bold" />
                        </BadgeIcon>
                        <BadgeLabel uppercase>Homepage</BadgeLabel>
                      </a>
                    </Badge>
                  )}
                </BadgeGroup>
              </Section>

              <Tabs defaultValue="readme">
                <TabsList>
                  <TabsTrigger value="readme">
                    <BookOpenTextIcon /> Readme
                  </TabsTrigger>
                  <TabsTrigger value="tools">
                    <ToolboxIcon /> Tools
                  </TabsTrigger>
                  <TabsTrigger value="transport">
                    <HardDriveIcon /> Transport
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="readme">
                  {entry.readme ? (
                    <Markdown className="!max-w-none rounded-xl border-[0.5px] bg-accent-subtle/20 p-6">
                      {entry.readme}
                    </Markdown>
                  ) : (
                    <EmptyState>
                      <EmptyStateTitle>No readme found</EmptyStateTitle>
                    </EmptyState>
                  )}
                </TabsContent>

                <TabsContent
                  value="tools"
                  className="rounded-xl border-[0.5px] bg-accent-subtle/20 p-6"
                >
                  <Section>
                    <SectionHeader>
                      <SectionTitle variant="h2" asChild>
                        <h3>Tools</h3>
                      </SectionTitle>
                    </SectionHeader>
                    <RegistryTools tools={entry.tools ?? []} />
                  </Section>
                </TabsContent>

                <TabsContent
                  value="transport"
                  className="flex flex-col gap-y-10 rounded-xl border-[0.5px] bg-accent-subtle/20 p-6"
                >
                  <Section>
                    <SectionHeader>
                      <SectionTitle variant="h2" asChild>
                        <h3>Overview</h3>
                      </SectionTitle>
                    </SectionHeader>
                    <McpDescriptionList transport={entry.transport} />
                  </Section>

                  <Section>
                    <SectionHeader>
                      <SectionTitle variant="h2" asChild>
                        <h3>Parameters</h3>
                      </SectionTitle>
                    </SectionHeader>
                    <RegistryParameters parameters={entry.parameters ?? []} />
                  </Section>
                </TabsContent>
              </Tabs>
            </div>
            <div className="hidden w-xs shrink-0 flex-col lg:flex">
              <div className="sticky top-0 rounded-xl bg-accent p-4">
                Add to proxy
                <RegistryInstallForm
                  mcp={entry}
                  proxies={storeQuery.data ?? []}
                />
              </div>
            </div>
          </div>
        </Container>
      </LayoutViewContent>

      <RegistryToolSheet
        tool={selectedTool}
        mcpName={entry.title}
        mcpId={entry.name}
      />
    </LayoutView>
  );
}
