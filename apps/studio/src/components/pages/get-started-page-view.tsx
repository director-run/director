"use client";

import { GetStartedInstallServerDialog } from "@/components/get-started/get-started-install-server-dialog";
import {
  ClientId,
  GetStartedInstallers,
} from "@/components/get-started/get-started-installers";
import {
  GetStartedList,
  GetStartedListItem,
} from "@/components/get-started/get-started-list";
import {
  GetStartedProxyForm,
  FormValues as ProxyFormValues,
  proxySchema,
} from "@/components/get-started/get-started-proxy-form";
import { McpLogo } from "@/components/mcp-logo";
import { Container } from "@/components/ui/container";
import { EmptyState, EmptyStateTitle } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  ListItemDescription,
  ListItemDetails,
  ListItemTitle,
} from "@/components/ui/list";
import { Logo } from "@/components/ui/logo";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import { toast } from "@/components/ui/toast";
import { useZodForm } from "@/hooks/use-zod-form";
import { DIRECTOR_URL } from "@/lib/urls";
import { trpc } from "@/trpc/client";
import { RegistryGetEntriesEntry, StoreGetAll } from "@/trpc/types";
import { ConfiguratorTarget } from "@director.run/client-configurator/index";
import { useState } from "react";
import { SubmitHandler } from "react-hook-form";

type StepStatus = "not-started" | "in-progress" | "completed";

interface Steps {
  create: StepStatus;
  add: StepStatus;
  connect: StepStatus;
}

interface GetStartedPageViewProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  registryEntries: RegistryGetEntriesEntry[];
  currentProxy: StoreGetAll[number] | null;
  steps: Steps;
}

export function GetStartedPageView({
  searchQuery,
  onSearchQueryChange,
  registryEntries,
  currentProxy,
  steps,
}: GetStartedPageViewProps) {
  // State for installers
  const [selectedClient, setSelectedClient] = useState<ClientId | undefined>(
    undefined,
  );
  const [selectedMcp, setSelectedMcp] =
    useState<RegistryGetEntriesEntry | null>(null);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);

  // tRPC queries and mutations
  const utils = trpc.useUtils();

  // Proxy form
  const proxyForm = useZodForm({
    schema: proxySchema,
    defaultValues: { name: "", description: "A proxy for getting started" },
  });

  const createProxyMutation = trpc.store.create.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.refetch();
      toast({
        title: "Proxy created",
        description: "This proxy was successfully created.",
      });
    },
  });

  // Installers
  const listClientsQuery = trpc.installer.allClients.useQuery();
  const installersQuery = trpc.installer.byProxy.list.useQuery(
    {
      proxyId: currentProxy?.id as string,
    },
    {
      enabled: !!currentProxy?.id,
    },
  );

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

  // MCP server installation
  const entryQuery = trpc.registry.getEntryByName.useQuery(
    {
      name: selectedMcp?.name || "",
    },
    {
      enabled: !!selectedMcp && isInstallDialogOpen,
    },
  );

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

  const availableClients = listClientsQuery.data ?? [];
  return (
    <Container size="sm" className="py-12 lg:py-16">
      <Section className="gap-y-8">
        <Logo className="mx-auto" />
        <SectionHeader className="items-center gap-y-1.5 text-center">
          <SectionTitle className="font-medium text-2xl">
            Get started
          </SectionTitle>
          <SectionDescription className="text-base">
            Let&apos;s get your started with MCP using Director.
          </SectionDescription>
        </SectionHeader>

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
            <div className="relative z-10 px-2 pt-2">
              <Input
                type="text"
                placeholder="Search MCP servers..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
              />
            </div>
            <div className="grid max-h-[320px] grid-cols-1 gap-1 overflow-y-auto p-2">
              {registryEntries
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((it) => {
                  return (
                    <div
                      key={it.id}
                      className="flex cursor-pointer flex-row items-center gap-x-3 rounded-lg bg-accent-subtle/60 px-2.5 py-1.5 hover:bg-accent"
                      onClick={() =>
                        handleMcpSelect(it as RegistryGetEntriesEntry)
                      }
                    >
                      <McpLogo src={it.icon} />
                      <ListItemDetails>
                        <ListItemTitle>{it.title}</ListItemTitle>
                        <ListItemDescription>
                          {it.description}
                        </ListItemDescription>
                      </ListItemDetails>
                    </div>
                  );
                })}

              {registryEntries.length === 0 && (
                <EmptyState className="bg-accent-subtle/60">
                  <EmptyStateTitle>No MCP servers found</EmptyStateTitle>
                </EmptyState>
              )}
            </div>
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
              availableClients={availableClients}
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
        />
      )}
    </Container>
  );
}
