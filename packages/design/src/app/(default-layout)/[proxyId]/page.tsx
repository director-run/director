"use client";

import { ConfiguratorTarget } from "@director.run/client-configurator/index";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutView,
  LayoutViewContent,
  LayoutViewHeader,
} from "../../../components/layout/layout";
import { McpToolSheet } from "../../../components/mcp-servers/mcp-tool-sheet";
import { ProxyDetail } from "../../../components/pages/workspace-detail";
import { ProxyActionsDropdown } from "../../../components/proxies/proxy-actions-dropdown";
import type { Client } from "../../../components/proxies/proxy-installers";
import { ProxySkeleton } from "../../../components/proxies/proxy-skeleton";
import { Badge, BadgeLabel } from "../../../components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../../../components/ui/breadcrumb";
import { toast } from "../../../components/ui/toast";
import { DIRECTOR_URL } from "../../../config";
import { trpc } from "../../../state/client";
import { useInspectMcp } from "../../../state/use-inspect-mcp";
import { useProxy } from "../../../state/use-proxy";
import {
  proxyQuerySerializer,
  useProxyQuery,
} from "../../../state/use-proxy-query";
const clients: Client[] = [
  {
    id: "claude",
    label: "Claude",
    image: "/icons/claude-icon.png",
    type: "installer",
  },
  {
    id: "cursor",
    label: "Cursor",
    image: "/icons/cursor-icon.png",
    type: "installer",
  },
  {
    id: "vscode",
    label: "VSCode",
    image: "/icons/code-icon.png",
    type: "installer",
  },
  {
    id: "goose",
    label: "Goose",
    image: "/icons/goose-icon.png",
    type: "deep-link",
  },
  {
    id: "raycast",
    label: "Raycast",
    image: "/icons/raycast-icon.png",
    type: "deep-link",
  },
];

export default function ProxyPage() {
  const router = useRouter();
  const params = useParams<{ proxyId: string }>();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { proxy, isLoading, installers } = useProxy(params.proxyId);
  const { toolId, serverId, setProxyQuery } = useProxyQuery();

  // Find the server and tool data
  const server = proxy?.servers.find((server) => server.name === serverId);
  const { tools, isLoading: toolsLoading } = useInspectMcp(
    params.proxyId,
    serverId || undefined,
  );
  const tool = tools.find((tool) => tool.name === toolId);

  const { data: availableClients, isLoading: isClientsLoading } =
    trpc.installer.allClients.useQuery();

  const utils = trpc.useUtils();

  const updateProxyMutation = trpc.store.update.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.invalidate();
      await utils.store.get.invalidate({ proxyId: params.proxyId });
      toast({
        title: "Proxy updated",
        description: "This proxy was successfully updated.",
      });
      router.refresh();
      setSettingsOpen(false);
    },
  });

  const deleteProxyMutation = trpc.store.delete.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.invalidate();
      toast({
        title: "Proxy deleted",
        description: "This proxy was successfully deleted.",
      });
      setDeleteOpen(false);
      router.push("/");
    },
  });

  const installationMutation = trpc.installer.byProxy.install.useMutation({
    onSuccess: () => {
      utils.installer.byProxy.list.invalidate();
      toast({
        title: "Proxy installed",
        description: `This proxy was successfully installed`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  const uninstallationMutation = trpc.installer.byProxy.uninstall.useMutation({
    onSuccess: () => {
      utils.installer.byProxy.list.invalidate();
      toast({
        title: "Proxy uninstalled",
        description: `This proxy was successfully uninstalled`,
      });
    },
  });

  const handleUpdateProxy = async (values: {
    name: string;
    description?: string;
  }) => {
    await updateProxyMutation.mutateAsync({
      proxyId: params.proxyId,
      attributes: values,
    });
  };

  const handleDeleteProxy = async () => {
    await deleteProxyMutation.mutateAsync({ proxyId: params.proxyId });
  };

  const handleInstall = (proxyId: string, client: ConfiguratorTarget) => {
    installationMutation.mutate({
      proxyId,
      client,
      baseUrl: DIRECTOR_URL,
    });
  };

  const handleUninstall = (proxyId: string, client: ConfiguratorTarget) => {
    uninstallationMutation.mutate({
      proxyId,
      client,
    });
  };

  const handleServerClick = (serverId: string) => {
    router.push(`/${params.proxyId}/mcp/${serverId}`);
  };

  useEffect(() => {
    if (!isLoading && !proxy) {
      toast({
        title: "Proxy not found",
        description: "The proxy you are looking for does not exist.",
      });
      router.push("/");
    }
  }, [proxy, isLoading]);

  if (isLoading || !proxy) {
    return <ProxySkeleton />;
  }

  // Generate toolLinks for the ProxyDetail component
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
        badges: server && (
          <Badge>
            <BadgeLabel uppercase>{server}</BadgeLabel>
          </Badge>
        ),
      };
    });

  return (
    <LayoutView>
      <LayoutViewHeader>
        <Breadcrumb className="grow">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{proxy.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <ProxyActionsDropdown
          proxy={proxy}
          onUpdateProxy={handleUpdateProxy}
          onDeleteProxy={handleDeleteProxy}
          isUpdating={updateProxyMutation.isPending}
          settingsOpen={settingsOpen}
          onSettingsOpenChange={setSettingsOpen}
          deleteOpen={deleteOpen}
          onDeleteOpenChange={setDeleteOpen}
        />
      </LayoutViewHeader>

      <LayoutViewContent>
        <ProxyDetail
          proxy={proxy}
          gatewayBaseUrl={DIRECTOR_URL}
          clients={clients}
          installers={installers}
          availableClients={availableClients ?? []}
          isClientsLoading={isClientsLoading}
          onInstall={handleInstall}
          onUninstall={handleUninstall}
          isInstalling={installationMutation.isPending}
          isUninstalling={uninstallationMutation.isPending}
          toolLinks={toolLinks}
          toolsLoading={toolsLoading}
          onLibraryClick={() => router.push("/library")}
          onServerClick={(serverId) =>
            router.push(`/${params.proxyId}/mcp/${serverId}`)
          }
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
