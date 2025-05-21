"use client";
import { McpDeleteConfirmation } from "@/components/mcp-servers/mcp-delete-confirmation";
import { McpDescriptionList } from "@/components/mcp-servers/mcp-description-list";
import { McpToolsTable } from "@/components/mcp-servers/mcp-tools-table";
import { Container } from "@/components/ui/container";
import {} from "@/components/ui/description-list";
import {
  Section,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import { trpc } from "@/trpc/client";
import { useParams } from "next/navigation";

export default function ProxyPage() {
  const params = useParams<{ proxyId: string; serverId: string }>();

  const decodedServerId = decodeURIComponent(params.serverId);

  const { data, isLoading, isError } = trpc.store.get.useQuery(
    {
      proxyId: params.proxyId,
    },
    {
      retry: false,
    },
  );

  if (isLoading) {
    // TODO: Add loading state
    return <div>Loading…</div>;
  }

  const server = data?.servers.find(
    (server) => server.name === decodedServerId,
  );

  if (isError || !data || !server) {
    // TODO: Add 404
    return <div>Not found</div>;
  }

  return (
    <Container className="py-12">
      <div className="flex w-full flex-col gap-y-8">
        <Section>
          <SectionHeader>
            <SectionTitle>{server.name}</SectionTitle>
          </SectionHeader>
          <McpDeleteConfirmation
            proxyId={params.proxyId}
            serverId={params.serverId}
          />
          <McpDescriptionList transport={server.transport} />
        </Section>

        <SectionSeparator />

        <Section>
          <SectionHeader>
            <SectionTitle variant="h2" asChild>
              <h3>Tools</h3>
            </SectionTitle>
          </SectionHeader>

          <McpToolsTable
            key={params.serverId}
            proxyId={params.proxyId}
            serverId={decodedServerId}
          />
        </Section>
      </div>
    </Container>
  );
}
