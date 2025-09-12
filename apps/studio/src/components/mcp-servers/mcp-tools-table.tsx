"use client";
import { Badge, BadgeLabel } from "@/components/ui/badge";
import { proxyQuerySerializer } from "@/state/use-proxy-query";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ListOfLinks } from "../list-of-links";

interface McpToolTableProps {
  tools: Tool[];
  isLoading: boolean;
  serverId?: string;
}

export function McpToolsTable({
  tools,
  isLoading,
  serverId,
}: McpToolTableProps) {
  return (
    <ListOfLinks
      isLoading={isLoading}
      links={tools
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((it) => {
          const server = it.description?.match(/\[([^\]]+)\]/)?.[1];

          return {
            title: it.name,
            subtitle: it.description?.replace(/\[([^\]]+)\]/g, ""),
            scroll: false,
            href: `${proxyQuerySerializer({
              toolId: it.name,
              serverId: server,
            })}`,
            badges: server && !serverId && (
              <Badge>
                <BadgeLabel uppercase>{server}</BadgeLabel>
              </Badge>
            ),
          };
        })}
    />
  );
}
