import {
  MCPLinkCard,
  MCPLinkCardList,
} from "@/components/mcp-servers/mcp-link-card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyStateTitle } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import { cn } from "@/helpers/cn";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";

interface RegistryEntry {
  id: string;
  name: string;
  title: string;
}

interface Pagination {
  pageIndex: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface RegistryItemListProps {
  entries: RegistryEntry[];
  pagination: Pagination;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPageChange: (pageIndex: number) => void;
  onAddManual: () => void;
  addManualButton: React.ReactNode;
}

export function RegistryItemList({
  entries,
  pagination,
  searchQuery,
  onSearchChange,
  onPageChange,
  onAddManual,
  addManualButton,
}: RegistryItemListProps) {
  return (
    <Container size="lg">
      <Section className="gap-y-6">
        <SectionHeader>
          <SectionTitle>Discover MCP servers</SectionTitle>
          <SectionDescription>
            Find MCP servers for your favourite tools and install them directly
            to your Director proxies.
          </SectionDescription>
        </SectionHeader>

        <div className="flex flex-col gap-y-4">
          <div className="flex flex-row items-center justify-between">
            <Input
              type="text"
              placeholder="Search MCP servers..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="max-w-md"
            />
            {addManualButton}
          </div>

          <MCPLinkCardList>
            {entries
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

            {entries.length === 0 && (
              <EmptyState className="col-span-2">
                <EmptyStateTitle>No MCP servers found</EmptyStateTitle>
              </EmptyState>
            )}
          </MCPLinkCardList>
        </div>

        {pagination.totalItems > 0 && (
          <div className="grid grid-cols-3 items-center gap-2">
            <div>
              <Button
                className={cn(!pagination.hasPreviousPage && "hidden")}
                variant="secondary"
                onClick={() => onPageChange(pagination.pageIndex - 1)}
              >
                <ArrowLeftIcon /> Previous
              </Button>
            </div>

            <span className="text-center text-fg-subtle text-sm leading-7">
              Page {pagination.pageIndex + 1} of {pagination.totalPages}
            </span>

            <div className="flex justify-end">
              <Button
                className={cn(!pagination.hasNextPage && "hidden")}
                variant="secondary"
                onClick={() => onPageChange(pagination.pageIndex + 1)}
              >
                Next <ArrowRightIcon />
              </Button>
            </div>
          </div>
        )}
      </Section>
    </Container>
  );
}
