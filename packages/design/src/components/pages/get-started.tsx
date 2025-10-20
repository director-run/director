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
  GetStartedPlaybookForm,
  type FormValues as PlaybookFormValues,
} from "../get-started/get-started-playbook-form";
import { playbookSchema } from "../get-started/get-started-playbook-form";
import type { RegistryEntryList } from "../types";
import type { Client } from "../types.ts";
import { Container } from "../ui/container";
import { Section } from "../ui/section";

type StepStatus = "not-started" | "in-progress" | "completed";

export interface GetStartedPageViewProps {
  isCreatePlaybookLoading: boolean;
  onCreatePlaybook: SubmitHandler<PlaybookFormValues>;
  currentPlaybook: { id: string; servers?: unknown[] } | null;

  // Registry
  registryEntries: RegistryEntryList;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onClickRegistryEntry: (entry: {
    name: string;
  }) => void;

  // Actions
  onAddPlaybookToClient: (clientId: string) => void;
  clientStatuses: Client[];
  isAddingPlaybookToClient: boolean;
}

export function GetStartedPageView(props: GetStartedPageViewProps) {
  const {
    currentPlaybook,
    registryEntries,
    clientStatuses,
    isAddingPlaybookToClient,
    isCreatePlaybookLoading,
    onCreatePlaybook,
    searchQuery,
    onSearchQueryChange,
    onClickRegistryEntry,
    onAddPlaybookToClient,
  } = props;

  const [selectedClient, setSelectedClient] = useState<string | undefined>();
  const playbookForm = useZodForm({
    schema: playbookSchema,
    defaultValues: { name: "", description: "A playbook for getting started" },
  });

  const hasPlaybook = !!currentPlaybook;
  const hasServers = (currentPlaybook?.servers?.length ?? 0) > 0;

  const steps = useMemo(() => {
    const create: StepStatus = hasPlaybook ? "completed" : "in-progress";
    const add: StepStatus = hasPlaybook
      ? hasServers
        ? "completed"
        : "in-progress"
      : "not-started";
    // With simplified props, we consider connect step "in-progress" until user triggers install
    const connect: StepStatus =
      hasPlaybook && hasServers ? "in-progress" : "not-started";
    return { create, add, connect };
  }, [hasPlaybook, hasServers]);

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
            title="Create a Playbook"
            disabled={steps.create === "completed"}
            open={steps.create === "in-progress"}
          >
            <div className="py-4 pr-4 pl-11.5">
              <GetStartedPlaybookForm
                form={playbookForm}
                isPending={isCreatePlaybookLoading}
                onSubmit={onCreatePlaybook}
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
              onMcpSelect={onClickRegistryEntry}
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
              clients={clientStatuses}
              isLoading={false}
              isInstalling={isAddingPlaybookToClient}
              onInstall={onAddPlaybookToClient}
            />
          </GetStartedListItem>
        </GetStartedList>
      </Section>
    </Container>
  );
}
