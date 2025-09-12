"use client";

import { LayoutView, LayoutViewContent } from "@/components/layout/layout";
import { LayoutNavigation } from "@/components/layout/navigation";
import { McpToolSheet } from "@/components/mcp-servers/mcp-tool-sheet";
import { ProxyDetail } from "@/components/pages/workspace-detail";
import { ProxyActionsDropdown } from "@/components/proxies/proxy-actions-dropdown";
import { Client } from "@/components/proxies/proxy-installers";
import { ProxySkeleton } from "@/components/proxies/proxy-skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { toast } from "@/components/ui/toast";
import { useProxy } from "@/hooks/use-proxy";
import { DIRECTOR_URL } from "@/lib/urls";
import { trpc } from "@/trpc/client";
import { ConfiguratorTarget } from "@director.run/client-configurator/index";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const {
    data: servers,
    isLoading: serversLoading,
    error: serversError,
  } = trpc.store.getAll.useQuery();

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
      </LayoutNavigation>

      <LayoutViewContent>
        <ProxyDetail
          proxy={proxy}
          clients={clients}
          installers={installers}
          availableClients={availableClients ?? []}
          isClientsLoading={isClientsLoading}
          onInstall={handleInstall}
          onUninstall={handleUninstall}
          isInstalling={installationMutation.isPending}
          isUninstalling={uninstallationMutation.isPending}
        />
      </LayoutViewContent>

      <McpToolSheet proxyId={proxy.id} />
    </LayoutView>
  );
}
