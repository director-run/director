"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutView,
  LayoutViewContent,
  LayoutViewHeader,
} from "../../../../../components/layout/layout";
import { McpToolSheet } from "../../../../../components/mcp-servers/mcp-tool-sheet";
import { WorkspaceTargetDetail } from "../../../../../components/pages/workspace-target-detail";
import { ProxySkeleton } from "../../../../../components/proxies/proxy-skeleton";
import { WorkspaceTargetDetailDropDownMenu } from "../../../../../components/proxies/workspace-target-detail-dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../../../components/ui/breadcrumb";
import { toast } from "../../../../../components/ui/toast";
import { trpc } from "../../../../../state/client";
import { useInspectMcp } from "../../../../../state/use-inspect-mcp";
import { useProxy } from "../../../../../state/use-proxy";
import {
  proxyQuerySerializer,
  useProxyQuery,
} from "../../../../../state/use-proxy-query";

export default function McpServerPage() {
  const router = useRouter();
  const params = useParams<{ proxyId: string; mcpId: string }>();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { proxy, isLoading } = useProxy(params.proxyId);
  const { toolId, serverId, setProxyQuery } = useProxyQuery();

  // Find the server and tool data
  const server = proxy?.servers.find((server) => server.name === serverId);
  const { tools, isLoading: toolsLoading } = useInspectMcp(
    params.proxyId,
    serverId || undefined,
  );
  const tool = tools.find((tool) => tool.name === toolId);

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

  const handleServerClick = (serverId: string) => {
    router.push(`/${params.proxyId}/mcp/${serverId}`);
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

  // Generate toolLinks for the McpServerDetail component
  const toolLinks = tools
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((it) => {
      const server = it.description?.match(/\[([^\]]+)\]/)?.[1];

      return {
        title: it.name,
        subtitle: it.description?.replace(/\[([^\]]+)\]/g, "") || "",
        scroll: false,
        href: `${proxyQuerySerializer({
          toolId: it.name,
          serverId: server,
        })}`,
        onClick: () =>
          setProxyQuery({
            toolId: it.name,
            serverId: server,
          }),
        badges: undefined, // No badges needed since we're in a specific server context
      };
    });

  return (
    <LayoutView>
      <LayoutViewHeader>
        <Breadcrumb className="grow">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => router.push(`/${proxy.id}`)}
                className="cursor-pointer"
              >
                {proxy?.name}
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
      </LayoutViewHeader>

      <LayoutViewContent>
        <WorkspaceTargetDetail
          mcp={mcp}
          proxy={proxy}
          entryData={entryData}
          description={description}
          toolLinks={toolLinks}
          toolsLoading={toolsLoading}
          onProxyClick={(proxyId) => router.push(`/${proxyId}`)}
        />
      </LayoutViewContent>

      <McpToolSheet
        open={serverId !== null && toolId !== null && !!server && !!proxy}
        onOpenChange={() => setProxyQuery({ toolId: null, serverId: null })}
        toolId={toolId}
        serverId={serverId}
        server={server}
        proxy={proxy}
        tool={tool}
        isLoading={toolsLoading}
        onServerClick={handleServerClick}
        onProxyClick={(proxyId) => router.push(`/${proxyId}`)}
      />
    </LayoutView>
  );
}
