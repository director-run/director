"use client";

import { GetStartedInstallServerDialog } from "@/components/get-started/get-started-install-server-dialog";
import {
  ClientId,
  ClientStatus,
  GetStartedInstallers,
} from "@/components/get-started/get-started-installers";
import {
  GetStartedList,
  GetStartedListItem,
} from "@/components/get-started/get-started-list";
import { GetStartedMcpServerList } from "@/components/get-started/get-started-mcp-server-list";
import {
  GetStartedProxyForm,
  FormValues as ProxyFormValues,
} from "@/components/get-started/get-started-proxy-form";
import {
  RegistryGetEntriesEntry,
  RegistryGetEntryByName,
  StoreGetAll,
} from "@/components/types";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import { UseFormReturn } from "react-hook-form";
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
  // Proxy form props
  proxyForm: UseFormReturn<ProxyFormValues>;
  isProxyFormPending: boolean;
  onProxySubmit: SubmitHandler<ProxyFormValues>;
  // Installer props
  selectedClient: ClientId | undefined;
  onClientSelect: (client: ClientId | undefined) => void;
  availableClients: ClientStatus[];
  isClientsLoading: boolean;
  isInstalling: boolean;
  onClientInstall: (client: ClientId) => void;
  // MCP selection props
  onMcpSelect: (mcp: RegistryGetEntriesEntry) => void;
  // MCP install dialog props
  selectedMcp: RegistryGetEntriesEntry | null;
  isInstallDialogOpen: boolean;
  onInstallDialogOpenChange: (open: boolean) => void;
  entryData: RegistryGetEntryByName | null | undefined;
  isEntryLoading: boolean;
  onMcpFormSubmit: SubmitHandler<{
    proxyId: string;
    parameters: Record<string, string>;
  }>;
  isFormSubmitting: boolean;
  isFormInstalling: boolean;
}

export function GetStartedPageView({
  searchQuery,
  onSearchQueryChange,
  registryEntries,
  currentProxy,
  steps,
  // Proxy form props
  proxyForm,
  isProxyFormPending,
  onProxySubmit,
  // Installer props
  selectedClient,
  onClientSelect,
  availableClients,
  isClientsLoading,
  isInstalling,
  onClientInstall,
  // MCP selection props
  onMcpSelect,
  // MCP install dialog props
  selectedMcp,
  isInstallDialogOpen,
  onInstallDialogOpenChange,
  entryData,
  isEntryLoading,
  onMcpFormSubmit,
  isFormSubmitting,
  isFormInstalling,
}: GetStartedPageViewProps) {
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
                isPending={isProxyFormPending}
                onSubmit={onProxySubmit}
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
              onClientSelect={onClientSelect}
              availableClients={availableClients}
              isLoading={isClientsLoading}
              isInstalling={isInstalling}
              onInstall={onClientInstall}
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
          onOpenChange={onInstallDialogOpenChange}
          entryData={entryData}
          isLoading={isEntryLoading}
          onFormSubmit={onMcpFormSubmit}
          isFormSubmitting={isFormSubmitting}
          isFormInstalling={isFormInstalling}
        />
      )}
    </Container>
  );
}
