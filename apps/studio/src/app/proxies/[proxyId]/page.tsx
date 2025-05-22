"use client";

import { ProxyTargetAttributes } from "@director.run/mcp/types";
import { SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { CursorInstaller } from "@/components/installers/cursor-installer";
import { McpServerSheet } from "@/components/mcp-servers/mcp-server-sheet";
import { McpToolsTable } from "@/components/mcp-servers/mcp-tools-table";
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
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import {} from "@/components/ui/sheet";
import { useProxy } from "@/hooks/use-proxy";
import { proxyQuerySerializer } from "@/hooks/use-proxy-query";
import { getDeterministicColor } from "@/lib/deterministic-colors";

function ServerListItem({
  server,
  proxyId,
}: { server: ProxyTargetAttributes; proxyId: string }) {
  const isFromRegistry = server.name.startsWith("registry__");
  const cleanName = server.name.replace("registry__", "");

  return (
    <Link
      scroll={false}
      replace
      href={`/proxies/${proxyId}${proxyQuerySerializer({ serverId: server.name })}`}
      className="group relative flex w-full cursor-pointer flex-col gap-6 overflow-hidden rounded-2xl bg-element p-4 transition-colors duration-200 ease-in-out hover:bg-element-hover"
    >
      <h3 className="text-lg">{cleanName}</h3>
      <div className="flex flex-row items-center gap-x-2">
        <Badge variant={getDeterministicColor(server.transport.type)}>
          {server.transport.type}
        </Badge>

        {server.transport.type === "stdio" && (
          <Badge variant={getDeterministicColor(server.transport.command)}>
            {server.transport.command}
          </Badge>
        )}

        {isFromRegistry && (
          <Badge variant={getDeterministicColor("from_registry")}>
            Registry
          </Badge>
        )}
      </div>
    </Link>
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
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
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
    <Container className="gap-y-16 py-20">
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

      <SectionSeparator />

      <Section>
        <SectionHeader>
          <SectionTitle className="leading-none" variant="h2" asChild>
            <h3>Usage</h3>
          </SectionTitle>
          <SectionDescription>
            Start using your proxy with your favourite tools.
          </SectionDescription>
        </SectionHeader>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <CursorInstaller installed={installers.cursor} proxyId={proxy.id} />
        </div>
      </Section>

      <SectionSeparator />

      <Section>
        <SectionHeader className="flex flex-row justify-between">
          <SectionTitle className="leading-7" variant="h2" asChild>
            <h3>MCP servers</h3>
          </SectionTitle>
          <RegistryDialog />
        </SectionHeader>

        <ServersList servers={proxy.servers} proxyId={proxy.id} />
      </Section>

      <SectionSeparator />

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
    </Container>
  );
}
