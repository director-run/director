"use client";

import { ConfiguratorTarget } from "@director.run/client-configurator/index";
import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { GetStartedCompleteDialog } from "../../components/get-started/get-started-complete-dialog";
import { GetStartedHeader } from "../../components/get-started/get-started-header";
import { GetStartedInstallServerDialog } from "../../components/get-started/get-started-install-server-dialog";
import { GetStartedInstallers } from "../../components/get-started/get-started-installers";
import {
  GetStartedList,
  GetStartedListItem,
} from "../../components/get-started/get-started-list";
import { GetStartedMcpServerList } from "../../components/get-started/get-started-mcp-server-list";
import {
  GetStartedProxyForm,
  proxySchema,
} from "../../components/get-started/get-started-proxy-form";
import type { FormValues as ProxyFormValues } from "../../components/get-started/get-started-proxy-form";
import { FullScreenLoader } from "../../components/pages/global/loader";
import type { RegistryGetEntriesEntry } from "../../components/types";
import { Container } from "../../components/ui/container";
import { Section } from "../../components/ui/section";
import { toast } from "../../components/ui/toast";
import { DIRECTOR_URL } from "../../config";
import { useZodForm } from "../../hooks/use-zod-form";
import { trpc } from "../../state/client";
import { registryQuerySerializer } from "../../state/use-registry-query";

type StepStatus = "not-started" | "in-progress" | "completed";

interface Steps {
  create: StepStatus;
  add: StepStatus;
  connect: StepStatus;
}

const clients = [
  {
    id: "claude",
    label: "Claude",
    image: "/icons/claude-icon.png",
  },
  {
    id: "cursor",
    label: "Cursor",
    image: "/icons/cursor-icon.png",
  },
  {
    id: "vscode",
    label: "VSCode",
    image: "/icons/code-icon.png",
  },
];

export type ClientId = (typeof clients)[number]["id"];

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

  const toolLinks = selectedMcp
    ? (selectedMcp.tools ?? [])
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((tool) => ({
          title: tool.name,
          subtitle: tool.description?.replace(/\[([^\]]+)\]/g, ""),
          scroll: false,
          href: registryQuerySerializer({
            toolId: tool.name,
            serverId: null,
          }),
        }))
    : [];

  if (!hasData) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <Container size="sm" className="py-12 lg:py-16">
        <Section className="gap-y-8">
          <GetStartedHeader
            title="Get started"
            description="Let's get you started with MCP using Director."
          />

          <GetStartedList>
            <GetStartedListItem
              status={steps.create}
              title="Create an MCP Proxy Server"
              disabled={steps.create === "completed"}
              open={steps.create === "in-progress"}
            >
              <div className="py-4 pr-4 pl-11.5">
                <GetStartedProxyForm
                  form={proxyForm}
                  isPending={createProxyMutation.isPending}
                  onSubmit={handleProxySubmit}
                />
              </div>
            </GetStartedListItem>
            <GetStartedListItem
              status={steps.add}
              title="Add your first MCP server"
              open={steps.add === "in-progress"}
              disabled={steps.add !== "in-progress"}
            >
              <GetStartedMcpServerList
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                registryEntries={registryEntriesQuery.data?.entries ?? []}
                onMcpSelect={handleMcpSelect}
              />
            </GetStartedListItem>
            <GetStartedListItem
              status={steps.connect}
              title="Connect your first client"
              open={steps.connect === "in-progress"}
              disabled={steps.connect !== "in-progress"}
            >
              <GetStartedInstallers
                selectedClient={selectedClient}
                onClientSelect={setSelectedClient}
                availableClients={listClientsQuery.data ?? []}
                clients={clients}
                isLoading={listClientsQuery.isLoading}
                isInstalling={installationMutation.isPending}
                onInstall={handleClientInstall}
              />
            </GetStartedListItem>
          </GetStartedList>
        </Section>

        {/* MCP Install Dialog */}
        {selectedMcp && (
          <GetStartedInstallServerDialog
            mcp={selectedMcp}
            proxyId={currentProxy?.id ?? ""}
            open={isInstallDialogOpen}
            onOpenChange={setIsInstallDialogOpen}
            entryData={entryQuery.data}
            isLoading={entryQuery.isLoading}
            onFormSubmit={handleMcpFormSubmit}
            isFormSubmitting={transportMutation.isPending}
            isFormInstalling={installServerMutation.isPending}
            toolLinks={toolLinks}
          />
        )}
      </Container>
      <GetStartedCompleteDialog open={isCompleted} />
    </>
  );
}
