"use client";

import {
  FileCodeIcon,
  GlobeIcon,
  PackageIcon,
  SealCheckIcon,
  TerminalIcon,
} from "@phosphor-icons/react";
import Link from "next/link";

import {
  LayoutView,
  LayoutViewContent,
  LayoutViewHeader,
} from "@/components/layout";
import { RegistryLibrarySkeleton } from "@/components/registry/registry-library-skeleton";
import { BadgeGroup, BadgeIcon, BadgeLabel } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { EmptyStateDescription } from "@/components/ui/empty-state";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyStateTitle } from "@/components/ui/empty-state";
import {
  List,
  ListItem,
  ListItemDescription,
  ListItemDetails,
  ListItemTitle,
} from "@/components/ui/list";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import { trpc } from "@/trpc/client";

export default function RegistryPage() {
  const { data, isLoading, error } = trpc.registry.getEntries.useQuery({
    pageIndex: 0,
    pageSize: 1000,
  });

  if (isLoading) {
    return <RegistryLibrarySkeleton />;
  }

  if (!data || error) {
    return (
      <RegistryLibrarySkeleton>
        <div className="absolute inset-0 grid place-items-center">
          <EmptyState>
            <EmptyStateTitle>Something went wrong.</EmptyStateTitle>
            <EmptyStateDescription>Please try again</EmptyStateDescription>
          </EmptyState>
        </div>
      </RegistryLibrarySkeleton>
    );
  }

  return (
    <LayoutView>
      <LayoutViewHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Library</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </LayoutViewHeader>
      <LayoutViewContent>
        <Container size="lg">
          <Section className="gap-y-6">
            <SectionHeader>
              <SectionTitle>Discover MCP servers</SectionTitle>
              <SectionDescription>
                Find MCP servers for your favourite tools and install them
                directly to your Director proxies.
              </SectionDescription>
            </SectionHeader>

            <List>
              {data.entries.map((entry) => (
                <ListItem key={entry.id} asChild>
                  <Link href={`/library/mcp/${entry.name}`}>
                    <ListItemDetails>
                      <ListItemTitle>{entry.title}</ListItemTitle>
                      <ListItemDescription className="line-clamp-none">
                        {entry.description}
                      </ListItemDescription>
                    </ListItemDetails>

                    <BadgeGroup className="ml-auto items-start justify-end">
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
                          <BadgeLabel uppercase>
                            {entry.transport.command}
                          </BadgeLabel>
                        </Badge>
                      )}
                    </BadgeGroup>
                  </Link>
                </ListItem>
              ))}
            </List>
          </Section>
        </Container>
      </LayoutViewContent>
    </LayoutView>
  );
}
