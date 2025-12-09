import { GetStartedCompleteDialog } from "@director.run/design/components/get-started/get-started-complete-dialog.tsx";
import { GetStartedInstallServerDialog } from "@director.run/design/components/get-started/get-started-install-server-dialog.tsx";
import type { PlaybookCreateFormValues } from "@director.run/design/components/get-started/get-started-playbook-form.tsx";
import { GetStartedPageView } from "@director.run/design/components/pages/get-started.tsx";
import { FullScreenLoader } from "@director.run/design/components/pages/global/loader.tsx";
import { toast } from "@director.run/design/components/ui/toast.tsx";
import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  registryClient,
  gatewayClient as trpc,
} from "../contexts/backend-context.tsx";
import { useCreatePrompt } from "../hooks/use-create-prompt.ts";
import { useInstallServerFromRegistry } from "../hooks/use-install-server-from-registry.ts";
import { useOnboardingProgress } from "../hooks/use-onboarding-progress.ts";
import { usePlaybooks } from "../hooks/use-playbooks.ts";
import { useRegistryEntries } from "../hooks/use-registry-entries.ts";

export function GetStartedPage() {
  const navigate = useNavigate();
  // Search and playbook state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPlaybookId, setCurrentPlaybookId] = useState<string | null>(
    null,
  );

  // Prompt step state
  const [isPromptCompleted, setIsPromptCompleted] = useState(false);

  // Installer state
  const [selectedRegistryEntryName, setSelectedRegistryEntryName] = useState<
    string | null
  >(null);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  // Note: isCompleted is now manually set - there's no auto-completion
  // since the user manually copies their connection info
  const [isCompleted] = useState(false);

  const { setInProgress } = useOnboardingProgress();

  // When this page renders, set onboarding to true
  useEffect(() => {
    setInProgress(true);
  }, [setInProgress]);

  // When process completes, set onboarding to false
  useEffect(() => {
    if (isCompleted) {
      setInProgress(false);
    }
  }, [isCompleted, setInProgress]);

  const utils = trpc.useUtils();

  const playbookListQuery = usePlaybooks();
  const registryEntriesQuery = useRegistryEntries({
    pageIndex: 0,
    pageSize: 20,
    searchQuery,
  });

  // Connection info for step 4
  const connectionInfoQuery = trpc.store.getConnectionInfo.useQuery(
    { playbookId: currentPlaybookId ?? "" },
    { enabled: !!currentPlaybookId },
  );

  const entryQuery = registryClient.entries.getEntryByName.useQuery(
    {
      name: selectedRegistryEntryName || "",
    },
    {
      enabled: !!selectedRegistryEntryName && isInstallDialogOpen,
    },
  );

  const createPlaybookMutation = trpc.store.create.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.refetch();
      toast({
        title: "Playbook created",
        description: "This playbook was successfully created.",
      });
    },
  });

  // Prompt creation
  const { createPrompt, isPending: isPromptSubmitting } = useCreatePrompt(
    currentPlaybookId || "",
    {
      onSuccess: () => {
        toast({
          title: "Prompt created",
          description: "Your prompt was successfully added to the playbook.",
        });
        setIsPromptCompleted(true);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
        });
      },
    },
  );

  const { install, isPending: isInstalling } = useInstallServerFromRegistry({
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
    onSuccess: (_data) => {
      utils.store.getAll.invalidate();
      toast({
        title: "Playbook installed",
        description: "This playbook was successfully installed.",
      });
      setIsInstallDialogOpen(false);
    },
  });

  useEffect(() => {
    if (playbookListQuery.data && playbookListQuery.data.length === 1) {
      setCurrentPlaybookId(playbookListQuery.data[0].id);
    }
  }, [playbookListQuery.data]);

  // Derived state
  const hasData = playbookListQuery.data && registryEntriesQuery.data;
  const hasPlaybook =
    playbookListQuery.data && playbookListQuery.data.length > 0;
  const currentPlaybook = hasPlaybook ? playbookListQuery.data[0] : null;

  // Event handlers
  const handlePlaybookSubmit: SubmitHandler<PlaybookCreateFormValues> = async (
    values,
  ) => {
    await createPlaybookMutation.mutateAsync(values);
  };

  const handleMcpSelect = (entry: { name: string }) => {
    setSelectedRegistryEntryName(entry.name);
    setIsInstallDialogOpen(true);
  };

  const handleMcpFormSubmit = async (values: {
    playbookId?: string;
    entryId: string;
    parameters?: Record<string, string>;
  }) => {
    if (!selectedRegistryEntryName || !values.playbookId) {
      return;
    }

    await install({
      playbookId: values.playbookId,
      entryName: selectedRegistryEntryName,
      parameters: values.parameters ?? {},
    });
  };

  const handlePromptFormSubmit = async (values: {
    title: string;
    description?: string;
    body: string;
  }) => {
    if (!currentPlaybookId) {
      return;
    }

    await createPrompt(values);
  };

  if (!hasData) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <GetStartedPageView
        currentPlaybook={currentPlaybook}
        registryEntries={registryEntriesQuery.data?.entries ?? []}
        isCreatePlaybookLoading={createPlaybookMutation.isPending}
        onCreatePlaybook={handlePlaybookSubmit}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onClickRegistryEntry={handleMcpSelect}
        connectionInfo={connectionInfoQuery.data}
        isConnectionInfoLoading={connectionInfoQuery.isLoading}
        onDone={() => navigate(`/${currentPlaybookId}`)}
        isPromptCompleted={isPromptCompleted}
        onSkipPrompt={() => setIsPromptCompleted(true)}
        onPromptFormSubmit={handlePromptFormSubmit}
        isPromptSubmitting={isPromptSubmitting}
      />

      {selectedRegistryEntryName && (
        <GetStartedInstallServerDialog
          registryEntry={entryQuery.data}
          playbooks={playbookListQuery.data}
          onClickInstall={handleMcpFormSubmit}
          isInstalling={isInstalling}
          open={isInstallDialogOpen}
          onOpenChange={setIsInstallDialogOpen}
        />
      )}

      <GetStartedCompleteDialog
        open={isCompleted}
        onClickLibrary={() => navigate("/library")}
        onClickPlaybook={() => navigate("/")}
      />
    </>
  );
}
