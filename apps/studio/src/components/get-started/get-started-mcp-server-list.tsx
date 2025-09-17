"use client";

import { McpLogo } from "../mcp-logo";
import type { RegistryEntryList } from "../types";
import { EmptyState, EmptyStateTitle } from "../ui/empty-state";
import { Input } from "../ui/input";
import {
  ListItemDescription,
  ListItemDetails,
  ListItemTitle,
} from "../ui/list";

interface GetStartedMcpServerListProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  registryEntries: RegistryEntryList;
  onMcpSelect: (entry: { name: string }) => void;
}

export function GetStartedMcpServerList({
  searchQuery,
  onSearchQueryChange,
  registryEntries,
  onMcpSelect,
}: GetStartedMcpServerListProps) {
  return (
    <>
      <div className="relative z-10 px-2 pt-2">
        <Input
          type="text"
          placeholder="Search MCP servers..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
      </div>
      <div className="grid max-h-[320px] grid-cols-1 gap-1 overflow-y-auto p-2">
        {registryEntries
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((it) => {
            return (
              <div
                key={it.id}
                className="flex cursor-pointer flex-row items-center gap-x-3 rounded-lg bg-accent-subtle/60 px-2.5 py-1.5 hover:bg-accent"
                onClick={() => onMcpSelect(it)}
              >
                <McpLogo src={it.icon} />
                <ListItemDetails>
                  <ListItemTitle>{it.title}</ListItemTitle>
                  <ListItemDescription>{it.description}</ListItemDescription>
                </ListItemDetails>
              </div>
            );
          })}

        {registryEntries.length === 0 && (
          <EmptyState className="bg-accent-subtle/60">
            <EmptyStateTitle>No MCP servers found</EmptyStateTitle>
          </EmptyState>
        )}
      </div>
    </>
  );
}
