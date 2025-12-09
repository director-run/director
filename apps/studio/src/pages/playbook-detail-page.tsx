import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";
import { PlaybookSectionConnect } from "@director.run/design/components/playbooks-clients/playbook-section-connect.tsx";
import { PlaybookActionsDropdown } from "@director.run/design/components/playbooks/playbook-actions-dropdown.tsx";
import { PlaybookSettingsSheet } from "@director.run/design/components/playbooks/playbook-settings-sheet.tsx";
import { PlaybookSkeleton } from "@director.run/design/components/playbooks/playbook-skeleton.tsx";
import { PromptList } from "@director.run/design/components/prompts/prompt-list.tsx";
import { PlaybookServerList } from "@director.run/design/components/servers/server-list.tsx";
import { SplitViewMain } from "@director.run/design/components/split-view.tsx";
import { SplitViewSide } from "@director.run/design/components/split-view.tsx";
import { SplitView } from "@director.run/design/components/split-view.tsx";
import { ToolList } from "@director.run/design/components/tools/tool-list.tsx";
import type { PlaybookDetail } from "@director.run/design/components/types.ts";
import { ConfirmDialog } from "@director.run/design/components/ui/confirm-dialog.tsx";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { Section } from "@director.run/design/components/ui/section.tsx";
import { SectionHeader } from "@director.run/design/components/ui/section.tsx";
import { SectionTitle } from "@director.run/design/components/ui/section.tsx";
import { SectionDescription } from "@director.run/design/components/ui/section.tsx";
import { Tab, Tabs } from "@director.run/design/components/ui/tabs.tsx";
import { toast } from "@director.run/design/components/ui/toast.js";
import { DesktopIcon, NotebookIcon, ToolboxIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { gatewayClient } from "../contexts/backend-context.tsx";
import { useAuthenticate } from "../hooks/use-authenticate.ts";
import { useCreatePrompt } from "../hooks/use-create-prompt.ts";
import { useDeletePrompt } from "../hooks/use-delete-prompt.ts";
import { useEditPrompt } from "../hooks/use-edit-prompt.ts";
import { useListTools } from "../hooks/use-list-tools.ts";
import { usePlaybook } from "../hooks/use-playbook.ts";
import { useUpdateTools } from "../hooks/use-update-tools.ts";

export const PlaybookDetailPage = () => {
  const { playbookId } = useParams();
  const navigate = useNavigate();
  const utils = gatewayClient.useUtils();

  if (!playbookId) {
    throw new Error("Playbook ID is required");
  }

  const { playbook, isPlaybookLoading, playbookError } =
    usePlaybook(playbookId);
  const { tools, isToolsLoading } = useListTools(playbookId);
  const { data: connectionInfo, isLoading: isConnectionInfoLoading } =
    gatewayClient.store.getConnectionInfo.useQuery({ playbookId });
  const { updateTools, isPending: isUpdatingTools } = useUpdateTools(
    playbookId,
    {
      onSuccess: () => {
        toast({
          title: "Tools updated",
          description: "Your tools have been successfully updated.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update tools",
        });
      },
    },
  );

  const { createPrompt, isPending: isCreatingPrompt } = useCreatePrompt(
    playbookId,
    {
      onSuccess: async () => {
        await utils.store.get.invalidate({
          playbookId: playbookId,
        });
        toast({ title: "Prompt saved", description: "Your prompt was saved." });
      },
    },
  );
  const { editPrompt, isPending: isEditingPrompt } = useEditPrompt(playbookId, {
    onSuccess: async () => {
      await utils.store.get.invalidate({
        playbookId: playbookId,
      });
      toast({
        title: "Prompt updated",
        description: "Your prompt was updated.",
      });
    },
  });

  const { deletePrompt, isPending: isDeletingPrompt } = useDeletePrompt(
    playbookId,
    {
      onSuccess: async () => {
        await utils.store.get.invalidate({
          playbookId: playbookId,
        });
        toast({
          title: "Prompt deleted",
          description: "Your prompt was deleted.",
        });
      },
    },
  );

  const { authenticate } = useAuthenticate();

  if (isPlaybookLoading) {
    return <PlaybookSkeleton />;
  }

  if (playbookError || !playbook) {
    return (
      <FullScreenError
        icon="dead-smiley"
        fullScreen={true}
        title={"Unexpected Error"}
        subtitle={playbookError?.message}
      />
    );
  }

  return (
    <>
      <LayoutBreadcrumbHeader
        breadcrumbs={[
          {
            title: playbookId,
          },
        ]}
      >
        <PlaybookEditMenu playbook={playbook} />
      </LayoutBreadcrumbHeader>

      <LayoutViewContent>
        <Container size="xl">
          <SplitView>
            <SplitViewMain>
              <Section className="gap-y-8">
                <SectionHeader>
                  <SectionTitle>{playbook.name}</SectionTitle>
                  <SectionDescription>
                    {playbook.description}
                  </SectionDescription>
                </SectionHeader>

                <Tabs default="servers">
                  <Tab
                    id="servers"
                    label="Servers"
                    icon={<DesktopIcon />}
                    content={
                      <PlaybookServerList
                        servers={playbook.servers}
                        onClickServer={(server) =>
                          navigate(`/${playbookId}/${server.name}`)
                        }
                        onClickAddServer={() => navigate("/library")}
                        onClickAuthorize={async (server) => {
                          try {
                            await authenticate({
                              playbookId: playbookId,
                              serverName: server.name,
                            });
                          } catch (error) {
                            toast({
                              title: "Authentication failed",
                              description:
                                error instanceof Error
                                  ? error.message
                                  : "Unknown error",
                            });
                          }
                        }}
                      />
                    }
                  />
                  <Tab
                    id="tools"
                    label="Tools"
                    icon={<ToolboxIcon />}
                    content={
                      <ToolList
                        tools={tools}
                        toolsLoading={isToolsLoading}
                        editable={true}
                        isSaving={isUpdatingTools}
                        onUpdateTools={updateTools}
                      />
                    }
                  />
                  <Tab
                    id="prompts"
                    label="Prompts"
                    icon={<NotebookIcon />}
                    content={
                      <PromptList
                        prompts={playbook.prompts ?? []}
                        onCreatePrompt={createPrompt}
                        onEditPrompt={editPrompt}
                        onDeletePrompt={deletePrompt}
                        isSavingPrompt={
                          isCreatingPrompt ||
                          isEditingPrompt ||
                          isDeletingPrompt
                        }
                      />
                    }
                  />
                </Tabs>
              </Section>
            </SplitViewMain>
            <SplitViewSide>
              <PlaybookSectionConnect
                connectionInfo={connectionInfo}
                isLoading={isConnectionInfoLoading}
              />
            </SplitViewSide>
          </SplitView>
        </Container>
      </LayoutViewContent>
    </>
  );
};

function PlaybookEditMenu({ playbook }: { playbook: PlaybookDetail }) {
  const navigate = useNavigate();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const utils = gatewayClient.useUtils();

  const updatePlaybookMutation = gatewayClient.store.update.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.invalidate();
      await utils.store.get.invalidate({ playbookId: playbook.id });
      toast({
        title: "Playbook updated",
        description: "This playbook was successfully updated.",
      });
      setSettingsOpen(false);
    },
  });

  const deletePlaybookMutation = gatewayClient.store.delete.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.invalidate();
      toast({
        title: "Playbook deleted",
        description: "This playbook was successfully deleted.",
      });
      setDeleteOpen(false);
      navigate("/");
    },
  });

  const handleUpdatePlaybook = async (values: {
    name: string;
    description?: string;
  }) => {
    await updatePlaybookMutation.mutateAsync({
      playbookId: playbook.id,
      attributes: values,
    });
  };

  const handleDeletePlaybook = async () => {
    await deletePlaybookMutation.mutateAsync({ playbookId: playbook.id });
  };

  return (
    <>
      <PlaybookActionsDropdown
        onSettingsClick={() => setSettingsOpen(true)}
        onDeleteClick={() => setDeleteOpen(true)}
      />
      <PlaybookSettingsSheet
        playbook={playbook}
        onSubmit={handleUpdatePlaybook}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
      <ConfirmDialog
        title="Delete playbook?"
        description="Are you sure you want to delete this playbook? This action cannot be undone."
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeletePlaybook}
      />
    </>
  );
}
