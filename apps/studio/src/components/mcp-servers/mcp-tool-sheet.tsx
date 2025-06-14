"use client";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { JSONSchema, type JsonSchema } from "@/components/ui/json-schema";
import { Markdown } from "@/components/ui/markdown";
import {
  Section,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import {
  Sheet,
  SheetActions,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useInspectMcp } from "@/hooks/use-inspect-mcp";
import { useProxy } from "@/hooks/use-proxy";
import { proxyQuerySerializer, useProxyQuery } from "@/hooks/use-proxy-query";
import type {
  ProxyServerAttributes,
  ProxyTargetAttributes,
} from "@director.run/utilities/schema";
import Link from "next/link";

function SheetInner({
  toolId,
  server,
  proxy,
}: {
  toolId: string;
  server: ProxyTargetAttributes;
  proxy: ProxyServerAttributes;
}) {
  const { tools, isLoading } = useInspectMcp(proxy.id, server.name);

  const tool = tools.find((tool) => tool.name === toolId);

  if (isLoading) {
    return (
      <>
        <SheetActions>
          <Badge className="mr-auto">Tool</Badge>
        </SheetActions>
        <SheetHeader className="pt-6">
          <SheetTitle>Loading tool…</SheetTitle>
          <SheetDescription>
            Installed from <span className="text-fg">{server?.name}</span> on{" "}
            <span className="text-fg">{proxy?.name}</span>
          </SheetDescription>
        </SheetHeader>
      </>
    );
  }

  if (!tool) {
    return (
      <>
        <SheetActions>
          <Badge className="mr-auto">Tool</Badge>
        </SheetActions>
        <SheetBody>
          <SheetHeader className="pt-6">
            <SheetTitle>Tool not found</SheetTitle>
            <SheetDescription>
              Installed from <span className="text-fg">{server?.name}</span> on{" "}
              <span className="text-fg">{proxy?.name}</span>
            </SheetDescription>
          </SheetHeader>
        </SheetBody>
      </>
    );
  }

  return (
    <>
      <SheetActions>
        <Breadcrumb className="grow">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${proxy.id}`}>{proxy?.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${proxy.id}/mcp/${server.name}`}>
                  {server?.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{tool.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </SheetActions>

      <SheetBody>
        <SheetHeader>
          <SheetTitle>{tool.name}</SheetTitle>
          <SheetDescription className="text-sm">
            Installed from{" "}
            <Link
              href={`/${proxy.id}${proxyQuerySerializer({ serverId: server.name })}`}
              className="text-fg"
            >
              {server?.name}
            </Link>{" "}
            on{" "}
            <Link href={`/${proxy.id}`} className="text-fg">
              {proxy?.name}
            </Link>
          </SheetDescription>
        </SheetHeader>

        <Markdown>
          {tool.description?.replace(`[${server?.name}] `, "")}
        </Markdown>

        <SectionSeparator />

        <Section>
          <SectionHeader>
            <SectionTitle variant="h2" asChild>
              <h3>Input schema</h3>
            </SectionTitle>
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
      </SheetBody>
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
