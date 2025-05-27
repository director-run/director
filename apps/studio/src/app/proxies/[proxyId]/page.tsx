"use client";

import { ProxyTargetAttributes } from "@director.run/mcp/types";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/app/design/components/breadcrumb";
import { Page, PageContent, PageHeader } from "@/app/design/components/page";
import { ScrambleText } from "@/app/design/components/scramble-text";
import { McpServerSheet } from "@/components/mcp-servers/mcp-server-sheet";
import { McpToolSheet } from "@/components/mcp-servers/mcp-tool-sheet";
import { McpToolsTable } from "@/components/mcp-servers/mcp-tools-table";
import { ProxyInstallers } from "@/components/proxies/proxy-installers";
import { ProxySettingsSheet } from "@/components/proxies/proxy-settings-sheet";
import { RegistryDialog } from "@/components/registry/registry-dialog";
import { RegistryEntryDialog } from "@/components/registry/registry-entry-dialog";
import { Button } from "@/components/ui/button";
import { Container, FullBleed } from "@/components/ui/container";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import {} from "@/components/ui/section";
import { useProxy } from "@/hooks/use-proxy";
import { proxyQuerySerializer } from "@/hooks/use-proxy-query";
import {
  DotsThreeOutlineVerticalIcon,
  FileCodeIcon,
  GlobeSimpleIcon,
  TerminalIcon,
} from "@phosphor-icons/react";

import { Badge, BadgeIcon, BadgeLabel } from "@/app/design/components/badge";
import * as DesignSection from "@/app/design/components/section";
import { ListOfLinks } from "@/components/list-of-links";

function ServerListItem({
  server,
  proxyId,
}: { server: ProxyTargetAttributes; proxyId: string }) {
  return (
    <Container
      size="lg"
      className="border-accent border-b-[0.5px] py-3 outline-none last:border-b-0 hover:bg-accent-subtle/50 focus-visible:bg-accent-subtle/50"
      asChild
    >
      <Link
        href={`/proxies/${proxyId}${proxyQuerySerializer({ serverId: server.name })}`}
        scroll={false}
      >
        <div className="flex flex-row gap-x-2">
          <div className="flex grow flex-col gap-y-0.5 py-0.5">
            <span className="font-medium font-mono text-[14px] leading-5 tracking-[0.01em]">
              {server.name}
            </span>
          </div>

          <div className="flex flex-row gap-1">
            <Badge>
              <BadgeIcon>
                {server.transport.type === "http" ? (
                  <GlobeSimpleIcon />
                ) : (
                  <TerminalIcon />
                )}
              </BadgeIcon>
              <BadgeLabel uppercase>
                {server.transport.type === "http" ? "HTTP" : "STDIO"}
              </BadgeLabel>
            </Badge>

            {server.transport.type === "stdio" && (
              <Badge>
                <BadgeIcon>
                  <FileCodeIcon />
                </BadgeIcon>
                <BadgeLabel uppercase>{server.transport.command}</BadgeLabel>
              </Badge>
            )}
          </div>
        </div>
      </Link>
    </Container>
  );
}

interface ServersListProps {
  servers: ProxyTargetAttributes[];
  proxyId: string;
}

function ServersList({ servers, proxyId }: ServersListProps) {
  if (servers.length === 0) {
    return (
      <Container size="lg">
        <EmptyState>
          <EmptyStateTitle>No servers configured</EmptyStateTitle>
          <EmptyStateDescription>
            Add a server to your proxy to get started.
          </EmptyStateDescription>
        </EmptyState>
      </Container>
    );
  }

  return (
    <div className="flex flex-col border-accent border-y-[0.5px]">
      {servers.map((it) => (
        <ServerListItem key={it.name} server={it} proxyId={proxyId} />
      ))}
    </div>
  );
}

export default function ProxyPage() {
  const params = useParams<{ proxyId: string }>();

  const { proxy, isLoading } = useProxy(params.proxyId);

  if (isLoading) {
    return (
      <Page>
        <PageHeader>
          <Breadcrumb className="grow">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="opacity-50">
                  <ScrambleText text="Loading proxy name" />
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Button size="icon" variant="ghost" disabled>
            <DotsThreeOutlineVerticalIcon weight="fill" className="!size-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </PageHeader>
        <PageContent>
          <Container size="lg">
            <DesignSection.Section>
              <DesignSection.SectionHeader>
                <DesignSection.SectionTitle className="opacity-50">
                  <ScrambleText text="Loading proxy name" />
                </DesignSection.SectionTitle>
                <DesignSection.SectionDescription className="opacity-50">
                  <ScrambleText text="Loading proxy description" />
                </DesignSection.SectionDescription>
              </DesignSection.SectionHeader>
            </DesignSection.Section>

            <DesignSection.Section>
              <DesignSection.SectionHeader>
                <DesignSection.SectionTitle variant="h2" asChild>
                  <h2>Usage</h2>
                </DesignSection.SectionTitle>
              </DesignSection.SectionHeader>
            </DesignSection.Section>

            <FullBleed className="space-y-3">
              <Container size="lg">
                <DesignSection.Section>
                  <DesignSection.SectionHeader className="flex flex-row items-center justify-between">
                    <DesignSection.SectionTitle variant="h2" asChild>
                      <h2>MCP Servers</h2>
                    </DesignSection.SectionTitle>
                    <Button disabled>Add</Button>
                  </DesignSection.SectionHeader>
                </DesignSection.Section>
              </Container>
              <ListOfLinks isLoading links={[]} />
            </FullBleed>

            <FullBleed className="space-y-3">
              <Container size="lg">
                <DesignSection.Section>
                  <DesignSection.SectionHeader>
                    <DesignSection.SectionTitle variant="h2" asChild>
                      <h2>Tools</h2>
                    </DesignSection.SectionTitle>
                  </DesignSection.SectionHeader>
                </DesignSection.Section>
              </Container>
              <ListOfLinks isLoading links={[]} />
            </FullBleed>
          </Container>
        </PageContent>
      </Page>
    );
  }

  if (!proxy) {
    // TODO: Add 404
    return <div>Not found</div>;
  }

  return (
    <Page>
      <PageHeader>
        <Breadcrumb className="grow">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{proxy.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <ProxySettingsSheet proxyId={proxy.id}>
          <Button size="icon" variant="ghost">
            <DotsThreeOutlineVerticalIcon weight="fill" className="!size-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </ProxySettingsSheet>
      </PageHeader>
      <PageContent>
        <Container size="lg">
          <DesignSection.Section>
            <DesignSection.SectionHeader>
              <DesignSection.SectionTitle>
                {proxy.name}
              </DesignSection.SectionTitle>
              <DesignSection.SectionDescription>
                {proxy.description}
              </DesignSection.SectionDescription>
            </DesignSection.SectionHeader>
          </DesignSection.Section>

          <DesignSection.Section>
            <DesignSection.SectionHeader>
              <DesignSection.SectionTitle variant="h2" asChild>
                <h2>Usage</h2>
              </DesignSection.SectionTitle>
            </DesignSection.SectionHeader>
            <ProxyInstallers proxyId={proxy.id} />
          </DesignSection.Section>

          <FullBleed className="space-y-3">
            <Container size="lg">
              <DesignSection.Section>
                <DesignSection.SectionHeader className="flex flex-row items-center justify-between">
                  <DesignSection.SectionTitle variant="h2" asChild>
                    <h2>MCP Servers</h2>
                  </DesignSection.SectionTitle>
                  <RegistryDialog />
                </DesignSection.SectionHeader>
              </DesignSection.Section>
            </Container>
            <ListOfLinks
              isLoading={isLoading}
              links={proxy.servers.map((it) => ({
                title: it.name,
                href: `/proxies/${proxy.id}${proxyQuerySerializer({ serverId: it.name })}`,
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
          </FullBleed>

          <FullBleed className="space-y-3">
            <Container size="lg">
              <DesignSection.Section>
                <DesignSection.SectionHeader>
                  <DesignSection.SectionTitle variant="h2" asChild>
                    <h2>Tools</h2>
                  </DesignSection.SectionTitle>
                </DesignSection.SectionHeader>
              </DesignSection.Section>
            </Container>
            <McpToolsTable proxyId={proxy.id} />
          </FullBleed>
        </Container>
      </PageContent>

      <McpServerSheet proxyId={proxy.id} />
      <RegistryEntryDialog proxyId={proxy.id} />
      <McpToolSheet proxyId={proxy.id} />
    </Page>
  );
}
