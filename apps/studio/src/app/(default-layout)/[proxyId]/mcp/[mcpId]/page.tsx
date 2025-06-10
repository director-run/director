"use client";

import { useParams, useRouter } from "next/navigation";

import {
  LayoutView,
  LayoutViewContent,
  LayoutViewHeader,
} from "@/components/layout";
import { McpLogo } from "@/components/mcp-logo";
import { McpDeleteConfirmation } from "@/components/mcp-servers/mcp-delete-confirmation";
import { McpDescriptionList } from "@/components/mcp-servers/mcp-description-list";
import { McpToolSheet } from "@/components/mcp-servers/mcp-tool-sheet";
import { McpToolsTable } from "@/components/mcp-servers/mcp-tools-table";
import { ProxySkeleton } from "@/components/proxies/proxy-skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState, EmptyStateTitle } from "@/components/ui/empty-state";
import { Markdown } from "@/components/ui/markdown";
import { MenuItemIcon, MenuItemLabel } from "@/components/ui/menu";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import { toast } from "@/components/ui/toast";
import { useProxy } from "@/hooks/use-proxy";
import { EntryGetParams } from "@director.run/registry/db/schema";
import { DotsThreeOutlineVerticalIcon, TrashIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect } from "react";

export default function ProxyPage() {
  const router = useRouter();
  const params = useParams<{ proxyId: string; mcpId: string }>();

  const { proxy, isLoading } = useProxy(params.proxyId);

  const mcp = proxy?.servers.find((server) => server.name === params.mcpId);

  useEffect(() => {
    if (!isLoading && (!proxy || !mcp)) {
      toast({
        title: "MCP server not found",
        description: "The MCP server you are looking for does not exist.",
      });

      if (!proxy) {
        router.push("/");
      }

      if (!mcp) {
        router.push(`/${params.proxyId}`);
      }
    }
  }, [proxy, isLoading]);

  if (isLoading || !proxy || !mcp) {
    return <ProxySkeleton />;
  }

  const entryData = mcp.source?.entryData as EntryGetParams;
  const description =
    typeof entryData === "object" &&
    entryData !== null &&
    typeof (entryData as { description: string }).description === "string"
      ? (entryData as { description: string }).description
      : null;

  return (
    <LayoutView>
      <LayoutViewHeader>
        <Breadcrumb className="grow">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${proxy.id}`}>{proxy?.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{mcp.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="radix-state-[open]:bg-accent-subtle"
            >
              <DotsThreeOutlineVerticalIcon weight="fill" className="!size-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <McpDeleteConfirmation proxyId={proxy.id} serverId={mcp.name}>
                <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                  <MenuItemIcon>
                    <TrashIcon />
                  </MenuItemIcon>
                  <MenuItemLabel>Delete</MenuItemLabel>
                </DropdownMenuItem>
              </McpDeleteConfirmation>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </LayoutViewHeader>

      <LayoutViewContent>
        <Container size="lg">
          <Section>
            <McpLogo
              src={entryData?.icon}
              fallback={mcp.name.charAt(0).toUpperCase()}
              className="size-9"
            />
            <SectionHeader>
              <SectionTitle>{mcp.name}</SectionTitle>
              <SectionDescription>
                Installed on{" "}
                <Link href={`/${proxy.id}`} className="text-fg">
                  {proxy?.name}
                </Link>
              </SectionDescription>
            </SectionHeader>

            {description ? <Markdown>{description}</Markdown> : null}
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h3>Transport</h3>
              </SectionTitle>
            </SectionHeader>

            <McpDescriptionList transport={mcp.transport} />
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h3>Tools</h3>
              </SectionTitle>
            </SectionHeader>

            <McpToolsTable proxyId={proxy.id} serverId={mcp.name} />
          </Section>

          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h3>Readme</h3>
              </SectionTitle>
            </SectionHeader>
            {entryData.readme ? (
              <div className="rounded-md border-[0.5px] bg-accent-subtle/20 px-4 py-8">
                <Markdown className="mx-auto">{entryData.readme}</Markdown>
              </div>
            ) : (
              <EmptyState>
                <EmptyStateTitle>No readme found</EmptyStateTitle>
              </EmptyState>
            )}
          </Section>
        </Container>
      </LayoutViewContent>

      <McpToolSheet proxyId={proxy.id} />
    </LayoutView>
  );
}
