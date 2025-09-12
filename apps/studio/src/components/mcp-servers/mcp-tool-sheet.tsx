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
  onProxyClick,
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
            onProxyClick={onProxyClick}
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
  onProxyClick,
}: {
  toolId: string;
  server: StoreServer;
  proxy: StoreGet;
  tool: Tool | undefined;
  isLoading: boolean;
  onServerClick?: (serverId: string) => void;
  onProxyClick?: (proxyId: string) => void;
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
              <BreadcrumbLink
                onClick={() => onProxyClick?.(proxy.id)}
                className="cursor-pointer"
              >
                {proxy?.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={
                  onServerClick ? () => onServerClick(server.name) : undefined
                }
                className={onServerClick ? "cursor-pointer" : ""}
              >
                {server?.name}
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
            <button
              type="button"
              onClick={() => onServerClick?.(server.name)}
              className="cursor-pointer text-fg hover:underline"
            >
              {server?.name}
            </button>{" "}
            on{" "}
            <button
              onClick={() => onProxyClick?.(proxy.id)}
              className="cursor-pointer text-fg underline"
            >
              {proxy?.name}
            </button>
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
  onProxyClick?: (proxyId: string) => void;
}
