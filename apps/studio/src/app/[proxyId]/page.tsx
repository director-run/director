"use client";
import { useParams } from "next/navigation";

import {
  MenuItemIcon,
  MenuItemLabel,
} from "@/app/design/components/primitives";
import {
  LayoutView,
  LayoutViewContent,
  LayoutViewHeader,
} from "@/components/layout";
import { ListOfLinks } from "@/components/list-of-links";
import { McpToolSheet } from "@/components/mcp-servers/mcp-tool-sheet";
import { McpToolsTable } from "@/components/mcp-servers/mcp-tools-table";
import { ProxyDeleteConfirmation } from "@/components/proxies/proxy-delete-confirmation";
import { ProxyInstallers } from "@/components/proxies/proxy-installers";
import { ProxyManualDialog } from "@/components/proxies/proxy-manual-dialog";
import { ProxySettingsSheet } from "@/components/proxies/proxy-settings-sheet";
import { ProxySkeleton } from "@/components/proxies/proxy-skeleton";
import { RegistryDialog } from "@/components/registry/registry-dialog";
import { RegistryEntryDialog } from "@/components/registry/registry-entry-dialog";
import { Badge, BadgeIcon, BadgeLabel } from "@/components/ui/badge";
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
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import { useProxy } from "@/hooks/use-proxy";
import {
  DotsThreeOutlineVerticalIcon,
  FileCodeIcon,
  GearIcon,
  GlobeSimpleIcon,
  TerminalIcon,
  TrashIcon,
} from "@phosphor-icons/react";

export default function ProxyPage() {
  const params = useParams<{ proxyId: string }>();

  const { proxy, isLoading } = useProxy(params.proxyId);

  if (isLoading) {
    return <ProxySkeleton />;
  }

  if (!proxy) {
    // TODO: Add 404
    return <div>Not found</div>;
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

          <Section>
            <SectionHeader className="flex flex-row items-center justify-between">
              <SectionTitle variant="h2" asChild>
                <h2>Clients</h2>
              </SectionTitle>
              <ProxyManualDialog proxyId={proxy.id}>
                <Button variant="secondary">Connect manually</Button>
              </ProxyManualDialog>
            </SectionHeader>
            <ProxyInstallers proxyId={proxy.id} />
          </Section>

          <Section>
            <SectionHeader className="flex flex-row items-center justify-between">
              <SectionTitle variant="h2" asChild>
                <h2>MCP Servers</h2>
              </SectionTitle>
              <RegistryDialog />
            </SectionHeader>
            <ListOfLinks
              isLoading={isLoading}
              links={proxy.servers.map((it) => ({
                title: it.name,
                href: `/${proxy.id}/mcp/${it.name}`,
                badges: (
                  <>
                    <Badge>
                      <BadgeIcon>
                        {it.transport.type === "http" ? (
                          <GlobeSimpleIcon />
                        ) : (
                          <TerminalIcon />
                        )}
                      </BadgeIcon>
                      <BadgeLabel uppercase>
                        {it.transport.type === "http" ? "HTTP" : "STDIO"}
                      </BadgeLabel>
                    </Badge>

                    {it.transport.type === "stdio" && (
                      <Badge>
                        <BadgeIcon>
                          <FileCodeIcon />
                        </BadgeIcon>
                        <BadgeLabel uppercase>
                          {it.transport.command}
                        </BadgeLabel>
                      </Badge>
                    )}
                  </>
                ),
              }))}
            />
          </Section>

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

      <RegistryEntryDialog proxyId={proxy.id} />
      <McpToolSheet proxyId={proxy.id} />
    </LayoutView>
  );
}
