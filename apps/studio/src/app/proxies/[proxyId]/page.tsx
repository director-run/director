"use client";

import { useParams } from "next/navigation";

import { CursorButton } from "@/components/installers/cursor-installer-button";
import { McpServersTable } from "@/components/mcp-servers/mcp-servers-table";
import { McpToolsTable } from "@/components/mcp-servers/mcp-tools-table";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import { trpc } from "@/trpc/client";
import Link from "next/link";

export default function ProxyPage() {
  const params = useParams<{ proxyId: string }>();

  const { data, isLoading, isError } = trpc.store.get.useQuery({
    proxyId: params.proxyId,
  });

  if (isLoading) {
    return (
      <div>
        <div>Loaaaaading…</div>
      </div>
    );
  }

  if (isError || !data) {
    // TODO: Add 404
    return <div>Not found</div>;
  }

  return (
    <Container className="py-12">
      <div className="flex w-full flex-col gap-y-8">
        <Section>
          <SectionHeader>
            <SectionTitle>{data.name}</SectionTitle>
            <SectionDescription
              className={data.description ? "" : "text-foreground-faint"}
            >
              {data.description ?? "No description"}
            </SectionDescription>
          </SectionHeader>

          <CursorButton proxyId={params.proxyId} />
        </Section>

        <SectionSeparator />

        <Section>
          <SectionHeader>
            <div className="flex flex-row justify-between">
              <SectionTitle className="leading-7" variant="h2" asChild>
                <h2>MCP servers</h2>
              </SectionTitle>
              <Button asChild>
                <Link href={`/proxies/${params.proxyId}/install`}>Add</Link>
              </Button>
            </div>
          </SectionHeader>

          <McpServersTable servers={data.servers} proxy={data} />
        </Section>

        <SectionSeparator />

        <Section>
          <SectionHeader>
            <SectionTitle>Tools</SectionTitle>
          </SectionHeader>

          <McpToolsTable proxyId={params.proxyId} />
        </Section>
      </div>
    </Container>
  );
}
