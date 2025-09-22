"use client";

import { ConfiguratorTarget } from "@director.run/client-configurator/index";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutView,
  LayoutViewContent,
} from "../../../components/layout/layout";
import { LayoutBreadcrumbHeader } from "../../../components/layout/layout-breadcrumb-header";
import { McpToolSheet } from "../../../components/mcp-servers/mcp-tool-sheet";
import { ProxyActionsDropdown } from "../../../components/proxies/proxy-actions-dropdown";
import { ProxyDeleteConfirmation } from "../../../components/proxies/proxy-delete-confirmation";
import type { Client } from "../../../components/proxies/proxy-installers";
import { ProxySettingsSheet } from "../../../components/proxies/proxy-settings-sheet";
import { ProxySkeleton } from "../../../components/proxies/proxy-skeleton";
import { WorkspaceSectionClients } from "../../../components/proxies/workspace-section-clients";
import { WorkspaceSectionHeader } from "../../../components/proxies/workspace-section-header";
import { WorkspaceSectionServers } from "../../../components/proxies/workspace-section-servers";
import { WorkspaceSectionTools } from "../../../components/proxies/workspace-section-tools";
import { Badge, BadgeLabel } from "../../../components/ui/badge";
import { Container } from "../../../components/ui/container";
import { SectionSeparator } from "../../../components/ui/section";
import { toast } from "../../../components/ui/toast";
import { DIRECTOR_URL } from "../../../config";
import { useChangeInstallState } from "../../../hooks/use-change-install-state";
import { useClients } from "../../../hooks/use-clients";
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
  const { changeInstallState, isPending } = useChangeInstallState(
    params.proxyId,
    {
      onSuccess: (_client, install) => {
        toast({
          title: install ? "Proxy installed" : "Proxy uninstalled",
          description: install
            ? "This proxy was successfully installed"
            : "This proxy was successfully uninstalled",
        });
      },
      onError: (_client, install) => {
        toast({
          title: "Error",
          description: install
            ? "Failed to install this proxy"
            : "Failed to uninstall this proxy",
        });
      },
    },
  );

  const { proxy, isLoading, installers } = useProxy(params.proxyId);
  const { toolId, serverId, setProxyQuery } = useProxyQuery();

  const { data: clientData, isLoading: isClientsLoading } = useClients(
    params.proxyId,
  );
  // Find the server and tool data
  const server = proxy?.servers.find((server) => server.name === serverId);
  const { tools, isLoading: toolsLoading } = useInspectMcp(
    params.proxyId,
    serverId || undefined,
  );
  const tool = tools.find((tool) => tool.name === toolId);

  const utils = trpc.useUtils();

  // Map hook data to legacy props expected by WorkspaceSectionClients
  const derivedInstallers = clientData
    ? Object.fromEntries(clientData.map((c) => [c.name, !!c.present]))
    : installers;
  const mappedAvailableClients = clientData
    ? clientData.map((c) => ({ name: c.name, installed: c.installed }))
    : [];

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

  // remove local install/uninstall mutations in favor of useChangeInstallState

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

  const handleInstall = async (
    _proxyId: string,
    client: ConfiguratorTarget,
  ) => {
    await changeInstallState(client, true);
  };

  const handleUninstall = async (
    _proxyId: string,
    client: ConfiguratorTarget,
  ) => {
    await changeInstallState(client, false);
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

  const workspace = proxy;

  return (
    <LayoutView>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: proxy.name,
          },
        ]}
      >
        <ProxyActionsDropdown
          onSettingsClick={() => setSettingsOpen(true)}
          onDeleteClick={() => setDeleteOpen(true)}
        />
      </LayoutBreadcrumbHeader>

      <LayoutViewContent>
        <Container size="lg">
          <WorkspaceSectionHeader workspace={workspace} />
          <SectionSeparator />
          <WorkspaceSectionClients
            workspace={workspace}
            gatewayBaseUrl={DIRECTOR_URL}
            clients={clients}
            installers={derivedInstallers}
            availableClients={mappedAvailableClients}
            isClientsLoading={isClientsLoading}
            onInstall={handleInstall}
            onUninstall={handleUninstall}
            isInstalling={isPending}
            isUninstalling={isPending}
          />
          <SectionSeparator />
          <WorkspaceSectionServers
            workspace={workspace}
            onLibraryClick={() => router.push("/library")}
            onServerClick={handleServerClick}
          />
          <SectionSeparator />
          <WorkspaceSectionTools
            toolLinks={toolLinks}
            toolsLoading={toolsLoading}
          />
        </Container>
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

      <ProxySettingsSheet
        proxy={proxy}
        onSubmit={handleUpdateProxy}
        isSubmitting={updateProxyMutation.isPending}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />

      <ProxyDeleteConfirmation
        onConfirm={handleDeleteProxy}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </LayoutView>
  );
}
