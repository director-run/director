"use client";

import { LayoutView, LayoutViewContent } from "@/components/layout/layout";
import { LayoutNavigation } from "@/components/layout/navigation";
import { McpToolSheet } from "@/components/mcp-servers/mcp-tool-sheet";
import { McpServerDetail } from "@/components/pages/workspace-target-detail";
import { ProxySkeleton } from "@/components/proxies/proxy-skeleton";
import { WorkspaceTargetDetailDropDownMenu } from "@/components/proxies/workspace-target-detail-dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Container } from "@/components/ui/container";
import { toast } from "@/components/ui/toast";
import { useProxy } from "@/hooks/use-proxy";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function McpServerPage() {
  const router = useRouter();
  const params = useParams<{ proxyId: string; mcpId: string }>();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { proxy, isLoading } = useProxy(params.proxyId);
  const {
    data: servers,
    isLoading: serversLoading,
    error: serversError,
  } = trpc.store.getAll.useQuery();

  const registryEntryQuery = trpc.registry.getEntryByName.useQuery(
    {
      name: params.mcpId,
    },
    {
      throwOnError: false,
    },
  );

  const utils = trpc.useUtils();

  const deleteServerMutation = trpc.store.removeServer.useMutation({
    onSuccess: async () => {
      await utils.store.get.invalidate({ proxyId: params.proxyId });
      await utils.store.getAll.invalidate();

      toast({
        title: "Server deleted",
        description: "This server was successfully deleted.",
      });
      setDeleteOpen(false);
      router.push(`/${params.proxyId}`);
    },
  });

  const mcp = proxy?.servers.find((server) => server.name === params.mcpId);

  const handleDeleteServer = async () => {
    await deleteServerMutation.mutateAsync({
      proxyId: params.proxyId,
      serverName: params.mcpId,
    });
  };

  useEffect(() => {
    if (!isLoading && (!proxy || !mcp)) {
      toast({
        title: "MCP server not found",
        description: "The MCP server you are looking for does not exist.",
      });

      if (!proxy) {
        router.push("/");
      }

      if (!mcp) {
        router.push(`/${params.proxyId}`);
      }
    }
  }, [proxy, isLoading]);

  if (isLoading || registryEntryQuery.isLoading || !proxy || !mcp) {
    return <ProxySkeleton />;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const entryData: any = registryEntryQuery.data ?? {};
  const description =
    typeof entryData === "object" &&
    entryData !== null &&
    typeof (entryData as { description: string }).description === "string"
      ? (entryData as { description: string }).description
      : null;

  return (
    <LayoutView>
      <LayoutNavigation
        servers={servers}
        isLoading={serversLoading}
        error={serversError?.message}
      >
        <Breadcrumb className="grow">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/${proxy.id}`}>{proxy?.name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{mcp.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <WorkspaceTargetDetailDropDownMenu
          onDelete={handleDeleteServer}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      </LayoutNavigation>

      <LayoutViewContent>
        <Container size="lg">
          <McpServerDetail
            mcp={mcp}
            proxy={proxy}
            entryData={entryData}
            description={description}
          />
        </Container>
      </LayoutViewContent>

      <McpToolSheet proxyId={proxy.id} />
    </LayoutView>
  );
}
