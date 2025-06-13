"use client";
import { useParams, useRouter } from "next/navigation";

import {
  LayoutView,
  LayoutViewContent,
  LayoutViewHeader,
} from "@/components/layout";
import {
  MCPLinkCard,
  MCPLinkCardList,
} from "@/components/mcp-servers/mcp-link-card";
import { McpToolSheet } from "@/components/mcp-servers/mcp-tool-sheet";
import { McpToolsTable } from "@/components/mcp-servers/mcp-tools-table";
import { ProxyDeleteConfirmation } from "@/components/proxies/proxy-delete-confirmation";
import { ProxyInstallers } from "@/components/proxies/proxy-installers";
import { ProxyManualDialog } from "@/components/proxies/proxy-manual-dialog";
import { ProxySettingsSheet } from "@/components/proxies/proxy-settings-sheet";
import { ProxySkeleton } from "@/components/proxies/proxy-skeleton";
import { RegistryCommand } from "@/components/registry/registry-command";
import {} from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
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
import { MenuItemIcon, MenuItemLabel } from "@/components/ui/menu";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import { toast } from "@/components/ui/toast";
import { useProxy } from "@/hooks/use-proxy";
import { SourceEntry } from "@director.run/gateway/db/schema";
import {
  DotsThreeOutlineVerticalIcon,
  GearIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useEffect } from "react";

export default function ProxyPage() {
  const router = useRouter();
  const params = useParams<{ proxyId: string }>();

  const { proxy, isLoading } = useProxy(params.proxyId);

  useEffect(() => {
    if (!isLoading && !proxy) {
      toast({
        title: "Proxy not found",
        description: "The proxy you are looking for does not exist.",
      });
      router.push("/");
    }
  }, [proxy, isLoading]);

  if (isLoading || !proxy) {
    return <ProxySkeleton />;
  }

  return (
    <LayoutView>
      <LayoutViewHeader>
        <Breadcrumb className="grow">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{proxy.name}</BreadcrumbPage>
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
              <ProxySettingsSheet proxyId={proxy.id}>
                <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                  <MenuItemIcon>
                    <GearIcon />
                  </MenuItemIcon>
                  <MenuItemLabel>Settings</MenuItemLabel>
                </DropdownMenuItem>
              </ProxySettingsSheet>
              <ProxyDeleteConfirmation proxyId={proxy.id}>
                <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                  <MenuItemIcon>
                    <TrashIcon />
                  </MenuItemIcon>
                  <MenuItemLabel>Delete</MenuItemLabel>
                </DropdownMenuItem>
              </ProxyDeleteConfirmation>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </LayoutViewHeader>

      <LayoutViewContent>
        <Container size="lg">
          <Section>
            <SectionHeader>
              <SectionTitle>{proxy.name}</SectionTitle>
              <SectionDescription>{proxy.description}</SectionDescription>
            </SectionHeader>
          </Section>

          <SectionSeparator />

          <Section>
            <SectionHeader className="flex flex-row items-center justify-between">
              <SectionTitle variant="h2" asChild>
                <h2>Clients</h2>
              </SectionTitle>
              <ProxyManualDialog proxyId={proxy.id}>
                <Button size="sm">Connect manually</Button>
              </ProxyManualDialog>
            </SectionHeader>
            <ProxyInstallers proxyId={proxy.id} />
          </Section>

          <SectionSeparator />

          <Section>
            <SectionHeader className="flex flex-row items-center justify-between">
              <SectionTitle variant="h2" asChild>
                <h2>MCP Servers</h2>
              </SectionTitle>
              <RegistryCommand serverId={proxy.id} />
            </SectionHeader>
            <MCPLinkCardList>
              {proxy.servers.map((it) => {
                return (
                  <MCPLinkCard
                    key={it.name}
                    entry={it.source?.entryData as SourceEntry}
                    href={`/${proxy.id}/mcp/${it.name}`}
                  />
                );
              })}
            </MCPLinkCardList>
          </Section>

          <SectionSeparator />

          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h2>Tools</h2>
              </SectionTitle>
            </SectionHeader>
            <McpToolsTable proxyId={proxy.id} />
          </Section>
        </Container>
      </LayoutViewContent>

      <McpToolSheet proxyId={proxy.id} />
    </LayoutView>
  );
}
