import { useMemo } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useZodForm } from "../../hooks/use-zod-form";
import {
  GetStartedConnect,
  type GetStartedConnectProps,
} from "../get-started/get-started-connect";
import { GetStartedHeader } from "../get-started/get-started-header";
import {
  GetStartedList,
  GetStartedListItem,
} from "../get-started/get-started-list";
import { GetStartedMcpServerList } from "../get-started/get-started-mcp-server-list";
import {
  GetStartedPlaybookForm,
  type PlaybookCreateFormValues as PlaybookFormValues,
} from "../get-started/get-started-playbook-form";
import { playbookSchema } from "../get-started/get-started-playbook-form";
import { PromptForm, type PromptFormData } from "../prompts/prompt-form";
import type { RegistryEntryList } from "../types";
import { Button } from "../ui/button";
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

  // Connection info for step 4
  connectionInfo: GetStartedConnectProps["connectionInfo"];
  isConnectionInfoLoading?: boolean;
  onDone?: () => void;

  // Prompt step
  isPromptCompleted: boolean;
  onSkipPrompt: () => void;
  onPromptFormSubmit: (data: PromptFormData) => Promise<void> | void;
  isPromptSubmitting: boolean;
}

export function GetStartedPageView(props: GetStartedPageViewProps) {
  const {
    currentPlaybook,
    registryEntries,
    isCreatePlaybookLoading,
    onCreatePlaybook,
    searchQuery,
    onSearchQueryChange,
    onClickRegistryEntry,
    connectionInfo,
    isConnectionInfoLoading,
    onDone,
    isPromptCompleted,
    onSkipPrompt,
    onPromptFormSubmit,
    isPromptSubmitting,
  } = props;

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
    const prompt: StepStatus =
      hasPlaybook && hasServers
        ? isPromptCompleted
          ? "completed"
          : "in-progress"
        : "not-started";
    const connect: StepStatus =
      hasPlaybook && hasServers && isPromptCompleted
        ? "in-progress"
        : "not-started";
    return { create, add, prompt, connect };
  }, [hasPlaybook, hasServers, isPromptCompleted]);

  return (
    <Container size="sm" className="py-12 lg:py-16">
      <Section className="gap-y-8">
        <GetStartedHeader
          title="Get started"
          description="Let's get you set up with Director"
        />

        <GetStartedList>
          <GetStartedListItem
            status={steps.create}
            title="1. Create a Playbook"
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
            title="2. Add an MCP server"
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
            status={steps.prompt}
            title="3. Add a Prompt"
            open={steps.prompt === "in-progress"}
            disabled={steps.prompt !== "in-progress"}
          >
            <div className="py-4 pr-4 pl-4">
              <PromptForm
                onSubmit={onPromptFormSubmit}
                isSubmitting={isPromptSubmitting}
                secondaryButton={
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.preventDefault();
                      onSkipPrompt();
                    }}
                  >
                    Skip
                  </Button>
                }
              />
            </div>
          </GetStartedListItem>
          <GetStartedListItem
            status={steps.connect}
            title="4. Connect your client"
            open={steps.connect === "in-progress"}
            disabled={steps.connect !== "in-progress"}
          >
            <GetStartedConnect
              connectionInfo={connectionInfo}
              isLoading={isConnectionInfoLoading}
              onDone={onDone}
            />
          </GetStartedListItem>
        </GetStartedList>
      </Section>
    </Container>
  );
}
