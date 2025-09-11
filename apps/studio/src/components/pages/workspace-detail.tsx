import {
  MCPLinkCard,
  MCPLinkCardList,
} from "@/components/mcp-servers/mcp-link-card";
import { McpToolsTable } from "@/components/mcp-servers/mcp-tools-table";
import { ProxyInstallers } from "@/components/proxies/proxy-installers";
import { ProxyManualDialog } from "@/components/proxies/proxy-manual-dialog";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import Link from "next/link";

interface ProxyDetailProps {
  proxy: {
    id: string;
    name: string;
    description?: string;
    servers: Array<{
      name: string;
    }>;
  };
  onCopy: (text: string) => Promise<void>;
}

export function ProxyDetail({ proxy, onCopy }: ProxyDetailProps) {
  return (
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
          <ProxyManualDialog proxyId={proxy.id} onCopy={onCopy}>
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
          <Button size="sm" asChild>
            <Link href="/library">Add MCP server</Link>
          </Button>
        </SectionHeader>
        <MCPLinkCardList>
          {proxy.servers.map((it) => {
            return (
              <MCPLinkCard
                key={it.name}
                entry={{
                  title: it.name,
                  description: null,
                  icon: null,
                  isOfficial: false,
                }}
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
  );
}
