import {
  proxyQueryStatesSerializer,
  useProxyQueryStates,
} from "@/hooks/use-proxy-query-states";
import { Proxy } from "@director/backend/src/services/db/schema";
import Link from "next/link";
import { Container } from "../container";
import { MCPCapabilitiesList } from "../mcp-servers/mcp-capabilities-list";
import { MCPServersList } from "../mcp-servers/mcp-servers-list";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "../section";
import { Button } from "../ui/button";
import { ProxyIntegrations } from "./proxy-integrations";

interface ProxyViewProps {
  proxy: Proxy;
}

export function ProxyView({ proxy }: ProxyViewProps) {
  const [proxyQueryStates] = useProxyQueryStates();

  return (
    <Container size="md">
      <Section>
        <SectionHeader>
          <SectionTitle>{proxy.name}</SectionTitle>
          {proxy.description && (
            <SectionDescription>{proxy.description}</SectionDescription>
          )}
        </SectionHeader>

        <ProxyIntegrations proxy={proxy} />
      </Section>

      <SectionSeparator />

      <Section>
        <SectionHeader>
          <SectionTitle variant="h2">MCP Servers</SectionTitle>
          <SectionDescription>
            These are proxied MCP servers that are available.
          </SectionDescription>
        </SectionHeader>

        <MCPServersList servers={proxy.servers} />

        <Button className="w-fit" asChild>
          <Link
            href={`/proxy${proxyQueryStatesSerializer({ ...proxyQueryStates, add: "mcp" })}`}
          >
            Add MCP server
          </Link>
        </Button>
      </Section>

      <SectionSeparator />

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
