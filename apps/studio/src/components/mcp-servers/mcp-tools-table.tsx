"use client";

import { useInspectMcp } from "@/hooks/use-inspect-mcp";
import Markdown from "react-markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Badge } from "../ui/badge";
import {} from "../ui/description-list";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "../ui/empty-state";

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
    <Accordion className="flex flex-col gap-y-1" type="multiple">
      {tools.map((tool) => {
        const server = tool.description?.match(/\[([^\]]+)\]/)?.[1];

        return (
          <AccordionItem key={tool.name} value={tool.name}>
            <AccordionTrigger>
              <div className="flex flex-row items-center gap-x-2">
                {!serverId && (
                  <Badge variant="inverse">
                    {server?.replace("registry__", "")}
                  </Badge>
                )}
                <span className="whitespace-pre font-mono text-sm leading-6">
                  {tool.name}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Markdown>
                {tool.description?.replace(`[${server}] `, "")}
              </Markdown>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
