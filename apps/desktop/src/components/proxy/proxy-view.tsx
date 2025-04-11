import { Proxy } from "@director/backend/src/services/db/schema";
import { Container } from "../container";
import { MCPCapabilitiesList } from "../mcp-servers/mcp-capabilities-list";
import { MCPServersList } from "../mcp-servers/mcp-servers-list";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "../section";
import { ProxyIntegrations } from "./proxy-integrations";

interface ProxyViewProps {
  proxy: Proxy;
}

export function ProxyView({ proxy }: ProxyViewProps) {
  return (
    <Container size="md">
      <Section>
        <SectionHeader>
          <SectionTitle>{proxy.name}</SectionTitle>
          <SectionDescription>{proxy.description}</SectionDescription>
        </SectionHeader>

        <ProxyIntegrations proxy={proxy} />
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle variant="h2">MCP Servers</SectionTitle>
          <SectionDescription>
            These are proxied MCP servers that are available.
          </SectionDescription>
        </SectionHeader>

        <MCPServersList servers={proxy.servers} />
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle variant="h2">Capabilities</SectionTitle>
          <SectionDescription>
            These are the full capabilities of this server.
          </SectionDescription>
        </SectionHeader>

        <MCPCapabilitiesList proxyId={proxy.id} />
      </Section>
    </Container>
  );
}
