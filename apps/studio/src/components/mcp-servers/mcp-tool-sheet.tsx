"use client";

import { Badge } from "@/components/ui/badge";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { JSONSchema, type JsonSchema } from "@/components/ui/json-schema";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import {
  Sheet,
  SheetActions,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useInspectMcp } from "@/hooks/use-inspect-mcp";
import { useProxy } from "@/hooks/use-proxy";
import { useProxyQuery } from "@/hooks/use-proxy-query";
import { ProxyAttributes } from "@director.run/gateway/db/schema";
import { ProxyTargetAttributes } from "@director.run/mcp/types";
import Markdown from "react-markdown";

function SheetInner({
  toolId,
  server,
  proxy,
}: { toolId: string; server: ProxyTargetAttributes; proxy: ProxyAttributes }) {
  const { tools, isLoading } = useInspectMcp(proxy.id, server.name);

  const tool = tools.find((tool) => tool.name === toolId);

  if (isLoading) {
    return (
      <>
        <SheetActions>
          <Badge className="mr-auto" variant="secondary">
            Tool
          </Badge>
        </SheetActions>
        <SheetHeader className="pt-6">
          <SheetTitle>Loading tool…</SheetTitle>
          <SheetDescription>
            Installed from{" "}
            <span className="text-foreground">{server?.name}</span> on{" "}
            <span className="text-foreground">{proxy?.name}</span>
          </SheetDescription>
        </SheetHeader>
      </>
    );
  }

  if (!tool) {
    return (
      <>
        <SheetActions>
          <Badge className="mr-auto" variant="secondary">
            Tool
          </Badge>
        </SheetActions>
        <SheetHeader className="pt-6">
          <SheetTitle>Tool not found</SheetTitle>
          <SheetDescription>
            Installed from{" "}
            <span className="text-foreground">{server?.name}</span> on{" "}
            <span className="text-foreground">{proxy?.name}</span>
          </SheetDescription>
        </SheetHeader>
      </>
    );
  }

  return (
    <>
      <SheetActions>
        <Badge className="mr-auto" variant="secondary">
          Tool
        </Badge>
      </SheetActions>

      <SheetHeader className="pt-6">
        <SheetTitle>{tool.name}</SheetTitle>
        <SheetDescription className="mb-4 text-sm">
          Installed from <span className="text-foreground">{server?.name}</span>{" "}
          on <span className="text-foreground">{proxy?.name}</span>
        </SheetDescription>

        <Markdown>
          {tool.description?.replace(`[${server?.name}] `, "")}
        </Markdown>
      </SheetHeader>

      <SectionSeparator className="my-12" />

      <Section>
        <SectionHeader>
          <SectionTitle variant="h3" asChild>
            <h3>Input schema</h3>
          </SectionTitle>
          <SectionDescription>
            The input schema for this tool.
          </SectionDescription>
        </SectionHeader>
        {tool.inputSchema ? (
          <JSONSchema schema={tool.inputSchema as JsonSchema} />
        ) : (
          <EmptyState>
            <EmptyStateTitle>No input schema</EmptyStateTitle>
            <EmptyStateDescription>
              This tool does not require any parameters.
            </EmptyStateDescription>
          </EmptyState>
        )}
      </Section>

      <SectionSeparator className="my-12" />

      <Section>
        <SectionHeader>
          <SectionTitle variant="h3" asChild>
            <h3>Output schema</h3>
          </SectionTitle>
          <SectionDescription>
            The output schema for this tool.
          </SectionDescription>
        </SectionHeader>
        {tool.outputSchema ? (
          <JSONSchema schema={tool.outputSchema as JsonSchema} />
        ) : (
          <EmptyState>
            <EmptyStateTitle>No output schema</EmptyStateTitle>
            <EmptyStateDescription>
              This tool does not provide an output schema.
            </EmptyStateDescription>
          </EmptyState>
        )}
      </Section>
    </>
  );
}

interface McpToolSheetProps {
  proxyId: string;
}

export function McpToolSheet({ proxyId }: McpToolSheetProps) {
  const { toolId, serverId, setProxyQuery } = useProxyQuery();
  const { proxy } = useProxy(proxyId);

  const server = proxy?.servers.find((server) => server.name === serverId);

  return (
    <Sheet
      open={serverId !== null && toolId !== null && !!server && !!proxy}
      onOpenChange={() => setProxyQuery({ toolId: null, serverId: null })}
    >
      <SheetContent>
        {server && proxy && toolId && (
          <SheetInner toolId={toolId} server={server} proxy={proxy} />
        )}
      </SheetContent>
    </Sheet>
  );
}
