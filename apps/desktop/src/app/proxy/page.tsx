"use client";
import { IntegrationDialog } from "@/components/integrations/integration-dialog";
import { AddMcpSheet } from "@/components/mcp-servers/add-mcp-sheet";
import { McpInfoSheet } from "@/components/mcp-servers/mcp-info-sheet";
import { ProxyView } from "@/components/proxy/proxy-view";
import { trpc } from "@/lib/trpc";
import { useQueryState } from "nuqs";
import { parseAsString } from "nuqs";

export default function ProxyPage() {
  const [proxyId] = useQueryState("proxyId", parseAsString);

  const [proxy] = trpc.store.get.useSuspenseQuery({
    proxyId: proxyId as string,
  });

  if (!proxy) {
    return <div>Not found</div>;
  }

  return (
    <>
      <ProxyView proxy={proxy} />
      <IntegrationDialog proxy={proxy} />
      <McpInfoSheet proxy={proxy} />
      <AddMcpSheet proxy={proxy} />
    </>
  );
}
