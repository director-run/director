"use client";
import { useState } from "react";

import {
  LayoutView,
  LayoutViewContent,
  LayoutViewHeader,
} from "@/components/layout";
import { McpAddSheet } from "@/components/mcp-servers/mcp-add-sheet";
import {
  MCPLinkCard,
  MCPLinkCardList,
} from "@/components/mcp-servers/mcp-link-card";
import { RegistryLibrarySkeleton } from "@/components/registry/registry-library-skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyStateDescription } from "@/components/ui/empty-state";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyStateTitle } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import { cn } from "@/lib/cn";
import { trpc } from "@/trpc/client";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";

export default function RegistryPage() {
  const [pageIndex, setPageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = trpc.registry.getEntries.useQuery(
    {
      pageIndex,
      pageSize: 20,
      searchQuery,
    },
    {
      placeholderData: (prev) => prev,
    },
  );

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

            <div className="flex flex-col gap-y-4">
              <div className="flex flex-row items-center justify-between">
                <Input
                  type="text"
                  placeholder="Search MCP servers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
                <McpAddSheet>
                  <Button>Add manually</Button>
                </McpAddSheet>
              </div>

              <MCPLinkCardList>
                {data.entries
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((entry) => {
                    return (
                      <MCPLinkCard
                        key={entry.id}
                        entry={entry}
                        href={`/library/mcp/${entry.name}`}
                      />
                    );
                  })}

                {data.entries.length === 0 && (
                  <EmptyState className="col-span-2">
                    <EmptyStateTitle>No MCP servers found</EmptyStateTitle>
                  </EmptyState>
                )}
              </MCPLinkCardList>
            </div>

            {data.pagination.totalItems > 0 && (
              <div className="grid grid-cols-3 items-center gap-2">
                <div>
                  <Button
                    className={cn(!data.pagination.hasPreviousPage && "hidden")}
                    variant="secondary"
                    onClick={() => setPageIndex(pageIndex - 1)}
                  >
                    <ArrowLeftIcon /> Previous
                  </Button>
                </div>

                <span className="text-center text-fg-subtle text-sm leading-7">
                  Page {data.pagination.pageIndex + 1} of{" "}
                  {data.pagination.totalPages}
                </span>

                <div className="flex justify-end">
                  <Button
                    className={cn(!data.pagination.hasNextPage && "hidden")}
                    variant="secondary"
                    onClick={() => setPageIndex(pageIndex + 1)}
                  >
                    Next <ArrowRightIcon />
                  </Button>
                </div>
              </div>
            )}
          </Section>
        </Container>
      </LayoutViewContent>
    </LayoutView>
  );
}
