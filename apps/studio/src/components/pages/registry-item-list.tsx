import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { cn } from "../../helpers/cn";
import { MCPLinkCard, MCPLinkCardList } from "../mcp-servers/mcp-link-card";
import { Button } from "../ui/button";
import { Container } from "../ui/container";
import { EmptyState } from "../ui/empty-state";
import { EmptyStateTitle } from "../ui/empty-state";
import { Input } from "../ui/input";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "../ui/section";

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
  onEntryClick?: (entryName: string) => void;
}

export function RegistryItemList({
  entries,
  pagination,
  searchQuery,
  onSearchChange,
  onPageChange,
  onAddManual,
  addManualButton,
  onEntryClick,
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
                    onClick={() => onEntryClick?.(entry.name)}
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
