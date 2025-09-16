"use client";

import { useMemo, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useZodForm } from "../../hooks/use-zod-form";
import { GetStartedHeader } from "../get-started/get-started-header";
import { GetStartedInstallers } from "../get-started/get-started-installers";
import {
  GetStartedList,
  GetStartedListItem,
} from "../get-started/get-started-list";
import { GetStartedMcpServerList } from "../get-started/get-started-mcp-server-list";
import {
  GetStartedProxyForm,
  type FormValues as ProxyFormValues,
} from "../get-started/get-started-proxy-form";
import { proxySchema } from "../get-started/get-started-proxy-form";
import type { RegistryGetEntriesEntry } from "../types";
import { Container } from "../ui/container";
import { Section } from "../ui/section";

type StepStatus = "not-started" | "in-progress" | "completed";

export type ClientId = "claude" | "cursor" | "vscode";

const clients: { id: ClientId; label: string; image: string }[] = [
  { id: "claude", label: "Claude", image: "/icons/claude-icon.png" },
  { id: "cursor", label: "Cursor", image: "/icons/cursor-icon.png" },
  { id: "vscode", label: "VSCode", image: "/icons/code-icon.png" },
];

type InstallerClientStatus = {
  name: string;
  installed: boolean;
  configExists: boolean;
  configPath: string;
};

export interface GetStartedPageViewProps {
  // Step 1: Create workspace
  isCreateWorkspaceLoading: boolean;
  onCreateWorkspace: SubmitHandler<ProxyFormValues>;
  currentWorkspace: { id: string; servers?: unknown[] } | null;

  // Registry
  registryEntries: RegistryGetEntriesEntry[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onClickRegistryEntry: (mcp: RegistryGetEntriesEntry) => void;

  // Actions
  onAddWorkspaceToClient: (clientId: ClientId) => void;
  clientStatuses: InstallerClientStatus[];
  isAddingWorkspaceToClient: boolean;
}

export function GetStartedPageView(props: GetStartedPageViewProps) {
  const {
    currentWorkspace: currentProxy,
    registryEntries,
    clientStatuses,
    isAddingWorkspaceToClient: isInstallingClient,
    isCreateWorkspaceLoading: createProxyIsPending,
    onCreateWorkspace: onCreateProxy,
    searchQuery,
    onSearchQueryChange,
    onClickRegistryEntry: onMcpSelect,
    onAddWorkspaceToClient: onInstallClient,
  } = props;

  const [selectedClient, setSelectedClient] = useState<ClientId | undefined>();
  const proxyForm = useZodForm({
    schema: proxySchema,
    defaultValues: { name: "", description: "A proxy for getting started" },
  });

  const hasProxy = !!currentProxy;
  const hasServers = (currentProxy?.servers?.length ?? 0) > 0;

  const steps = useMemo(() => {
    const create: StepStatus = hasProxy ? "completed" : "in-progress";
    const add: StepStatus = hasProxy
      ? hasServers
        ? "completed"
        : "in-progress"
      : "not-started";
    // With simplified props, we consider connect step "in-progress" until user triggers install
    const connect: StepStatus =
      hasProxy && hasServers ? "in-progress" : "not-started";
    return { create, add, connect };
  }, [hasProxy, hasServers]);

  return (
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
                isPending={createProxyIsPending}
                onSubmit={onCreateProxy}
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
              onSearchQueryChange={onSearchQueryChange}
              registryEntries={registryEntries}
              onMcpSelect={onMcpSelect}
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
              availableClients={clientStatuses}
              clients={clients}
              isLoading={false}
              isInstalling={isInstallingClient}
              onInstall={onInstallClient}
            />
          </GetStartedListItem>
        </GetStartedList>
      </Section>
    </Container>
  );
}
