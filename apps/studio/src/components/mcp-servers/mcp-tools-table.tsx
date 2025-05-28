"use client";
import { Badge, BadgeLabel } from "@/components/ui/badge";
import {} from "@/components/ui/empty-state";
import { useInspectMcp } from "@/hooks/use-inspect-mcp";
import { proxyQuerySerializer } from "@/hooks/use-proxy-query";
import { ListOfLinks } from "../list-of-links";

interface McpToolTableProps {
  proxyId: string;
  serverId?: string;
}

export function McpToolsTable({ proxyId, serverId }: McpToolTableProps) {
  const { isLoading, tools } = useInspectMcp(proxyId, serverId);

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
