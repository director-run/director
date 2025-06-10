"use client";

import {
  LayoutView,
  LayoutViewContent,
  LayoutViewHeader,
} from "@/components/layout";
import { McpLogo } from "@/components/mcp-logo";
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
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import { toast } from "@/components/ui/toast";
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
  const store = storeQuery.data;

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

        <RegistryInstallDialog mcp={entry} proxies={store ?? []}>
          <Button className="ml-auto" disabled={!store?.length}>
            Add to proxy
          </Button>
        </RegistryInstallDialog>
      </LayoutViewHeader>

      <LayoutViewContent>
        <Container size="lg">
          <Section className="gap-y-6">
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
              {entry.transport.type === "http" && (
                <Badge>
                  <BadgeIcon>
                    <GlobeIcon />
                  </BadgeIcon>
                  <BadgeLabel uppercase>HTTP</BadgeLabel>
                </Badge>
              )}
              {entry.transport.type === "stdio" && (
                <Badge>
                  <BadgeIcon>
                    <TerminalIcon />
                  </BadgeIcon>
                  <BadgeLabel uppercase>STDIO</BadgeLabel>
                </Badge>
              )}

              {entry.transport.type === "stdio" && (
                <Badge>
                  <BadgeIcon>
                    {(() => {
                      switch (entry.transport.command) {
                        case "docker":
                          return <PackageIcon />;
                        default:
                          return <FileCodeIcon />;
                      }
                    })()}
                  </BadgeIcon>
                  <BadgeLabel uppercase>{entry.transport.command}</BadgeLabel>
                </Badge>
              )}

              {entry.homepage && (
                <Badge
                  className="ml-auto transition-opacity duration-200 hover:opacity-50"
                  asChild
                >
                  <a
                    href={entry.homepage}
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
            <McpDescriptionList transport={entry.transport} />
          </Section>

          <SectionSeparator />

          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h3>Parameters</h3>
              </SectionTitle>
            </SectionHeader>
            <RegistryParameters parameters={entry.parameters ?? []} />
          </Section>

          <SectionSeparator />

          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h3>Tools</h3>
              </SectionTitle>
            </SectionHeader>
            <RegistryTools tools={entry.tools ?? []} />
          </Section>
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
