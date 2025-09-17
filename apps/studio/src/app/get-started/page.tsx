"use client";

import { ConfiguratorTarget } from "@director.run/client-configurator/index";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { GetStartedCompleteDialog } from "../../components/get-started/get-started-complete-dialog";
import { GetStartedInstallServerDialog } from "../../components/get-started/get-started-install-server-dialog";
import { proxySchema } from "../../components/get-started/get-started-proxy-form";
import type { FormValues as ProxyFormValues } from "../../components/get-started/get-started-proxy-form";
import { GetStartedPageView } from "../../components/pages/get-started";
import { FullScreenLoader } from "../../components/pages/global/loader";
import { toast } from "../../components/ui/toast";
import { DIRECTOR_URL } from "../../config";
import { useZodForm } from "../../hooks/use-zod-form";
import { trpc } from "../../state/client";

export type ClientId = "claude" | "cursor" | "vscode";

export default function GetStartedPage() {
  const router = useRouter();
  // Search and proxy state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentProxyId, setCurrentProxyId] = useState<string | null>(null);

  // Installer state
  const [selectedRegistryEntryName, setSelectedRegistryEntryName] = useState<
    string | null
  >(null);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // tRPC utils
  const utils = trpc.useUtils();

  // Proxy queries
  const proxyListQuery = trpc.store.getAll.useQuery();
  const registryEntriesQuery = trpc.registry.getEntries.useQuery(
    {
      pageIndex: 0,
      pageSize: 20,
      searchQuery,
    },
    {
      placeholderData: (prev) => prev,
    },
  );

  const installersQuery = trpc.installer.byProxy.list.useQuery(
    {
      proxyId: currentProxyId as string,
    },
    {
      enabled: !!currentProxyId,
    },
  );

  // Additional queries for installers
  const listClientsQuery = trpc.installer.allClients.useQuery();
  const entryQuery = trpc.registry.getEntryByName.useQuery(
    {
      name: selectedRegistryEntryName || "",
    },
    {
      enabled: !!selectedRegistryEntryName && isInstallDialogOpen,
    },
  );

  // Proxy form
  const proxyForm = useZodForm({
    schema: proxySchema,
    defaultValues: { name: "", description: "A proxy for getting started" },
  });

  // Mutations
  const createProxyMutation = trpc.store.create.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.refetch();
      toast({
        title: "Proxy created",
        description: "This proxy was successfully created.",
      });
    },
  });

  const installationMutation = trpc.installer.byProxy.install.useMutation({
    onSuccess: () => {
      utils.installer.byProxy.list.invalidate();
      toast({
        title: "Proxy installed",
        description: `This proxy was successfully installed`,
      });
      setIsCompleted(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  const transportMutation = trpc.registry.getTransportForEntry.useMutation();
  const installServerMutation = trpc.store.addServer.useMutation({
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
    onSuccess: (data) => {
      utils.store.getAll.invalidate();
      toast({
        title: "Proxy installed",
        description: "This proxy was successfully installed.",
      });
      setIsInstallDialogOpen(false);
    },
  });

  // Auto-select proxy when only one exists
  useEffect(() => {
    if (proxyListQuery.data && proxyListQuery.data.length === 1) {
      setCurrentProxyId(proxyListQuery.data[0].id);
    }
  }, [proxyListQuery.data]);

  // Derived state
  const hasData = proxyListQuery.data && registryEntriesQuery.data;
  const hasProxy = proxyListQuery.data && proxyListQuery.data.length > 0;
  const currentProxy = hasProxy ? proxyListQuery.data[0] : null;
  const hasInstallers =
    installersQuery.data && Object.values(installersQuery.data).some(Boolean);

  // Event handlers
  const handleProxySubmit: SubmitHandler<ProxyFormValues> = async (values) => {
    await createProxyMutation.mutateAsync({ ...values, servers: [] });
  };

  const handleClientInstall = (client: ClientId) => {
    if (!currentProxy?.id) {
      return;
    }
    installationMutation.mutate({
      proxyId: currentProxy.id,
      client: client as ConfiguratorTarget,
      baseUrl: DIRECTOR_URL,
    });
  };

  const handleMcpSelect = (entry: { name: string }) => {
    setSelectedRegistryEntryName(entry.name);
    setIsInstallDialogOpen(true);
  };

  const handleMcpFormSubmit = async (values: {
    proxyId?: string;
    entryId: string;
    parameters?: Record<string, string>;
  }) => {
    if (!selectedRegistryEntryName) {
      return;
    }
    const transport = await transportMutation.mutateAsync({
      entryName: selectedRegistryEntryName,
      parameters: values.parameters ?? {},
    });
    if (values.proxyId) {
      installServerMutation.mutate({
        proxyId: values.proxyId,
        server: {
          name: selectedRegistryEntryName,
          transport,
        },
      });
    }
  };

  if (!hasData) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <GetStartedPageView
        currentWorkspace={currentProxy}
        registryEntries={registryEntriesQuery.data?.entries ?? []}
        clientStatuses={listClientsQuery.data ?? []}
        isAddingWorkspaceToClient={installationMutation.isPending}
        isCreateWorkspaceLoading={createProxyMutation.isPending}
        onCreateWorkspace={handleProxySubmit}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onClickRegistryEntry={handleMcpSelect}
        onAddWorkspaceToClient={handleClientInstall}
      />

      {selectedRegistryEntryName && (
        <GetStartedInstallServerDialog
          registryEntry={entryQuery.data}
          isRegistryEntryLoading={entryQuery.isLoading}
          proxies={proxyListQuery.data}
          entryInstalledOn={[]} // No existing installations in get-started flow
          onClickInstall={handleMcpFormSubmit}
          isInstalling={installServerMutation.isPending}
          open={isInstallDialogOpen}
          onOpenChange={setIsInstallDialogOpen}
        />
      )}

      <GetStartedCompleteDialog
        open={isCompleted}
        onClickLibrary={() => router.push("/library")}
        onClickWorkspace={() => router.push("/")}
      />
    </>
  );
}
