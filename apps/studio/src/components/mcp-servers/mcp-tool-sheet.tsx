"use client";

import { StoreGet, StoreServer } from "@/components/types";
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
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import Link from "next/link";

export function McpToolSheet({
  open,
  onOpenChange,
  toolId,
  serverId,
  server,
  proxy,
  tool,
  isLoading,
  onServerClick,
}: McpToolSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {server && proxy && toolId && (
          <SheetInner
            toolId={toolId}
            server={server}
            proxy={proxy}
            tool={tool}
            isLoading={isLoading}
            onServerClick={onServerClick}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function SheetInner({
  toolId,
  server,
  proxy,
  tool,
  isLoading,
  onServerClick,
}: {
  toolId: string;
  server: StoreServer;
  proxy: StoreGet;
  tool: Tool | undefined;
  isLoading: boolean;
  onServerClick?: (serverId: string) => void;
}) {
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
              <BreadcrumbLink
                asChild={!onServerClick}
                onClick={
                  onServerClick ? () => onServerClick(server.name) : undefined
                }
              >
                {onServerClick ? (
                  <button type="button" className="text-left">
                    {server?.name}
                  </button>
                ) : (
                  <Link href={`/${proxy.id}/mcp/${server.name}`}>
                    {server?.name}
                  </Link>
                )}
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
            {onServerClick ? (
              <button
                type="button"
                onClick={() => onServerClick(server.name)}
                className="text-fg hover:underline"
              >
                {server?.name}
              </button>
            ) : (
              <Link
                href={`/${proxy.id}?serverId=${server.name}`}
                className="text-fg"
              >
                {server?.name}
              </Link>
            )}{" "}
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolId: string | null;
  serverId: string | null;
  server: StoreServer | undefined;
  proxy: StoreGet | undefined;
  tool: Tool | undefined;
  isLoading: boolean;
  onServerClick?: (serverId: string) => void;
}
