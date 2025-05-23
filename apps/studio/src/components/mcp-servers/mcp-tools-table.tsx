"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { useInspectMcp } from "@/hooks/use-inspect-mcp";
import { proxyQuerySerializer } from "@/hooks/use-proxy-query";
import { getDeterministicColor } from "@/lib/deterministic-colors";

interface McpToolTableProps {
  proxyId: string;
  serverId?: string;
}

export function McpToolsTable({ proxyId, serverId }: McpToolTableProps) {
  const { isLoading, tools } = useInspectMcp(proxyId, serverId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-1">
        <div className="h-14 rounded-2xl bg-element/50" />
        <div className="h-14 rounded-2xl bg-element/50" />
        <div className="h-14 rounded-2xl bg-element/50" />
        <div className="h-14 rounded-2xl bg-element/50" />
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <EmptyState>
        <EmptyStateTitle>No tools found</EmptyStateTitle>
        <EmptyStateDescription>
          This server does not have any tools installed.
        </EmptyStateDescription>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-row flex-wrap gap-2.5">
      {tools.map((tool) => {
        const server = tool.description?.match(/\[([^\]]+)\]/)?.[1];

        return (
          <Badge
            variant={server ? getDeterministicColor(server) : "secondary"}
            key={tool.name}
            size="lg"
            asChild
          >
            <Link
              href={`/proxies/${proxyId}${proxyQuerySerializer({
                toolId: tool.name,
                serverId: server,
              })}`}
              scroll={false}
            >
              <span className="">{tool.name}</span>
              {!serverId && <span className="opacity-80">({server})</span>}
            </Link>
          </Badge>
        );
      })}
    </div>
  );
}
