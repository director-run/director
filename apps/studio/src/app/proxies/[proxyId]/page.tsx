"use client";

import { ProxyTargetAttributes } from "@director.run/mcp/types";
import { SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { McpServerSheet } from "@/components/mcp-servers/mcp-server-sheet";
import { McpToolSheet } from "@/components/mcp-servers/mcp-tool-sheet";
import { McpToolsTable } from "@/components/mcp-servers/mcp-tools-table";
import { ProxyInstallers } from "@/components/proxies/proxy-installers";
import { ProxySettingsSheet } from "@/components/proxies/proxy-settings-sheet";
import { RegistryDialog } from "@/components/registry/registry-dialog";
import { RegistryEntryDialog } from "@/components/registry/registry-entry-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import { useProxy } from "@/hooks/use-proxy";
import { proxyQuerySerializer } from "@/hooks/use-proxy-query";
import { getDeterministicColor } from "@/lib/deterministic-colors";

function ServerListItem({
  server,
  proxyId,
}: { server: ProxyTargetAttributes; proxyId: string }) {
  return (
    <Badge variant={getDeterministicColor(server.name)} size="lg" asChild>
      <Link
        href={`/proxies/${proxyId}${proxyQuerySerializer({ serverId: server.name })}`}
        scroll={false}
      >
        <span className="">{server.name}</span>
      </Link>
    </Badge>
  );
}

interface ServersListProps {
  servers: ProxyTargetAttributes[];
  proxyId: string;
}

function ServersList({ servers, proxyId }: ServersListProps) {
  if (servers.length === 0) {
    return (
      <EmptyState>
        <EmptyStateTitle>No servers configured</EmptyStateTitle>
        <EmptyStateDescription>
          Add a server to your proxy to get started.
        </EmptyStateDescription>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-row flex-wrap gap-2.5">
      {servers.map((it) => (
        <ServerListItem key={it.name} server={it} proxyId={proxyId} />
      ))}
    </div>
  );
}

export default function ProxyPage() {
  const params = useParams<{ proxyId: string }>();

  const { proxy, installers, isLoading } = useProxy(params.proxyId);

  if (isLoading) {
    return (
      <div>
        <div>Loaaaaading…</div>
      </div>
    );
  }

  if (!proxy) {
    // TODO: Add 404
    return <div>Not found</div>;
  }

  return (
    <Container className="gap-y-24 py-20">
      <Section>
        <SectionHeader className="flex-row gap-x-8">
          <div className="flex grow flex-col gap-2">
            <SectionTitle>{proxy.name}</SectionTitle>
            {proxy.description && (
              <SectionDescription>{proxy.description}</SectionDescription>
            )}
          </div>

          <ProxySettingsSheet proxyId={proxy.id}>
            <Button size="icon" variant="secondary">
              <SettingsIcon />
              <span className="sr-only">Settings</span>
            </Button>
          </ProxySettingsSheet>
        </SectionHeader>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle className="leading-none" variant="h2" asChild>
            <h3>Usage</h3>
          </SectionTitle>
          <SectionDescription>
            Easily add your proxy to your favourite tools.
          </SectionDescription>
        </SectionHeader>
        <ProxyInstallers proxyId={proxy.id} />
      </Section>

      <Section>
        <SectionHeader className="flex flex-row justify-between">
          <SectionTitle className="leading-7" variant="h2" asChild>
            <h3>MCP servers</h3>
          </SectionTitle>
          <RegistryDialog />
        </SectionHeader>

        <ServersList servers={proxy.servers} proxyId={proxy.id} />
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle variant="h2" asChild>
            <h3>Tools</h3>
          </SectionTitle>
        </SectionHeader>
        <McpToolsTable proxyId={proxy.id} />
      </Section>

      <McpServerSheet proxyId={proxy.id} />
      <RegistryEntryDialog proxyId={proxy.id} />
      <McpToolSheet proxyId={proxy.id} />
    </Container>
  );
}
