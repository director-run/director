import { GetStartedCompleteDialog } from "@director.run/design/components/get-started/get-started-complete-dialog.tsx";
import { GetStartedInstallServerDialog } from "@director.run/design/components/get-started/get-started-install-server-dialog.tsx";
import { GetStartedPageView } from "@director.run/design/components/pages/get-started.tsx";
import { toast } from "@director.run/design/components/ui/toast.tsx";
import { mockRegistryEntryList } from "@director.run/design/test/fixtures/registry/entry-list.ts";
import { mockRegistryEntry } from "@director.run/design/test/fixtures/registry/entry.ts";
import { useState } from "react";
import { delay, kitchenSinkConnectionInfo } from "../fixtures";
import type { KitchenSinkNavigate } from "../types";

const ONBOARDING_PLAYBOOK_ID = "getting-started";

interface GetStartedRouteProps {
  navigate: KitchenSinkNavigate;
  firstPlaybookId?: string;
}

export function GetStartedRoute({
  navigate,
  firstPlaybookId,
}: GetStartedRouteProps) {
  const [currentPlaybook, setCurrentPlaybook] = useState<{
    id: string;
    servers: { name: string }[];
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPromptCompleted, setIsPromptCompleted] = useState(false);
  const [installEntryName, setInstallEntryName] = useState<string | null>(null);
  const [installOpen, setInstallOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);

  const exitTo = firstPlaybookId
    ? { name: "playbook" as const, playbookId: firstPlaybookId }
    : { name: "library" as const };

  const listEntry = mockRegistryEntryList.find(
    (entry) => entry.name === installEntryName,
  );
  const installEntry = listEntry
    ? {
        ...mockRegistryEntry,
        name: listEntry.name,
        title: listEntry.title,
        description: listEntry.description,
        icon: listEntry.icon,
        homepage: listEntry.homepage,
      }
    : mockRegistryEntry;

  return (
    <div className="h-screen w-screen overflow-y-auto bg-bg text-fg">
      <GetStartedPageView
        currentPlaybook={currentPlaybook}
        isCreatePlaybookLoading={isCreating}
        onCreatePlaybook={async () => {
          setIsCreating(true);
          await delay(500);
          setCurrentPlaybook({ id: ONBOARDING_PLAYBOOK_ID, servers: [] });
          setIsCreating(false);
        }}
        registryEntries={mockRegistryEntryList}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onClickRegistryEntry={(entry) => {
          setInstallEntryName(entry.name);
          setInstallOpen(true);
        }}
        connectionInfo={kitchenSinkConnectionInfo(
          currentPlaybook?.id ?? ONBOARDING_PLAYBOOK_ID,
        )}
        isConnectionInfoLoading={false}
        onDone={() => setCompleteOpen(true)}
        isPromptCompleted={isPromptCompleted}
        onSkipPrompt={() => setIsPromptCompleted(true)}
        onPromptFormSubmit={async () => {
          await delay(400);
          setIsPromptCompleted(true);
          toast({
            title: "Prompt saved",
            description: "Your prompt was saved.",
          });
        }}
        isPromptSubmitting={false}
      />

      <GetStartedInstallServerDialog
        registryEntry={installEntry}
        playbooks={[]}
        open={installOpen}
        onOpenChange={setInstallOpen}
        isInstalling={isInstalling}
        onClickInstall={async () => {
          setIsInstalling(true);
          await delay(600);
          setCurrentPlaybook((current) =>
            current
              ? {
                  ...current,
                  servers: [
                    ...current.servers,
                    { name: installEntryName ?? "server" },
                  ],
                }
              : current,
          );
          setIsInstalling(false);
          setInstallOpen(false);
          toast({
            title: "Server added",
            description: "The server has been added to your playbook.",
          });
        }}
      />

      <GetStartedCompleteDialog
        open={completeOpen}
        onClickLibrary={() => navigate({ name: "library" })}
        onClickPlaybook={() => navigate(exitTo)}
      />
    </div>
  );
}
