"use client";

import { GetStartedCompleteDialog } from "@/components/get-started/get-started-complete-dialog";
import { ClientId } from "@/components/get-started/get-started-installers";
import {
  FormValues as ProxyFormValues,
  proxySchema,
} from "@/components/get-started/get-started-proxy-form";
import { GetStartedPageView } from "@/components/pages/get-started-page-view";
import { FullScreenLoader } from "@/components/pages/global/loader";
import { RegistryGetEntriesEntry } from "@/components/types";
import { toast } from "@/components/ui/toast";
import { useZodForm } from "@/hooks/use-zod-form";
import { DIRECTOR_URL } from "@/lib/urls";
import { trpc } from "@/trpc/client";
import { ConfiguratorTarget } from "@director.run/client-configurator/index";
import { useEffect, useState } from "react";
import { SubmitHandler } from "react-hook-form";

type StepStatus = "not-started" | "in-progress" | "completed";

interface Steps {
  create: StepStatus;
  add: StepStatus;
  connect: StepStatus;
}

export default function GetStartedPage() {
  // Search and proxy state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentProxyId, setCurrentProxyId] = useState<string | null>(null);

  // Installer state
  const [selectedClient, setSelectedClient] = useState<ClientId | undefined>(
    undefined,
  );
  const [selectedMcp, setSelectedMcp] =
    useState<RegistryGetEntriesEntry | null>(null);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);

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
      name: selectedMcp?.name || "",
    },
    {
      enabled: !!selectedMcp && isInstallDialogOpen,
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
  const hasServers = (currentProxy?.servers.length ?? 0) > 0;
  const hasInstallers =
    installersQuery.data && Object.values(installersQuery.data).some(Boolean);

  // Step logic
  const steps: Steps = {
    create: hasProxy ? "completed" : "in-progress",
    add: hasProxy ? (hasServers ? "completed" : "in-progress") : "not-started",
    connect:
      hasProxy && hasServers
        ? hasInstallers
          ? "completed"
          : "in-progress"
        : "not-started",
  };

  const isCompleted =
    steps.create === "completed" &&
    steps.add === "completed" &&
    steps.connect === "completed";

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

  const handleMcpSelect = (mcp: RegistryGetEntriesEntry) => {
    setSelectedMcp(mcp);
    setIsInstallDialogOpen(true);
  };

  const handleMcpFormSubmit: SubmitHandler<{
    proxyId: string;
    parameters: Record<string, string>;
  }> = async (values) => {
    if (!selectedMcp) {
      return;
    }
    const transport = await transportMutation.mutateAsync({
      entryName: selectedMcp.name,
      parameters: values.parameters,
    });
    installServerMutation.mutate({
      proxyId: values.proxyId,
      server: {
        name: selectedMcp.name,
        transport,
      },
    });
  };

  if (!hasData) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <GetStartedPageView
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        registryEntries={registryEntriesQuery.data?.entries ?? []}
        currentProxy={currentProxy}
        steps={steps}
        // Proxy form props
        proxyForm={proxyForm}
        isProxyFormPending={createProxyMutation.isPending}
        onProxySubmit={handleProxySubmit}
        // Installer props
        selectedClient={selectedClient}
        onClientSelect={setSelectedClient}
        availableClients={listClientsQuery.data ?? []}
        isClientsLoading={listClientsQuery.isLoading}
        isInstalling={installationMutation.isPending}
        onClientInstall={handleClientInstall}
        // MCP selection props
        onMcpSelect={handleMcpSelect}
        // MCP install dialog props
        selectedMcp={selectedMcp}
        isInstallDialogOpen={isInstallDialogOpen}
        onInstallDialogOpenChange={setIsInstallDialogOpen}
        entryData={entryQuery.data}
        isEntryLoading={entryQuery.isLoading}
        onMcpFormSubmit={handleMcpFormSubmit}
        isFormSubmitting={transportMutation.isPending}
        isFormInstalling={installServerMutation.isPending}
      />
      <GetStartedCompleteDialog open={isCompleted} />
    </>
  );
}
