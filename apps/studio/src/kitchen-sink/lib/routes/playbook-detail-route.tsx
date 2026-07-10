import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.tsx";
import { LayoutViewContent } from "@director.run/design/components/layout/layout.tsx";
import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";
import type { ConnectionInfo } from "@director.run/design/components/playbooks-clients/playbook-section-connect.tsx";
import { PlaybookSectionConnect } from "@director.run/design/components/playbooks-clients/playbook-section-connect.tsx";
import { PlaybookActionsDropdown } from "@director.run/design/components/playbooks/playbook-actions-dropdown.tsx";
import type { PlaybookFormData } from "@director.run/design/components/playbooks/playbook-form.tsx";
import { PlaybookSettingsSheet } from "@director.run/design/components/playbooks/playbook-settings-sheet.tsx";
import { PlaybookSkeleton } from "@director.run/design/components/playbooks/playbook-skeleton.tsx";
import { PromptList } from "@director.run/design/components/prompts/prompt-list.tsx";
import { PlaybookServerList } from "@director.run/design/components/servers/server-list.tsx";
import {
  SplitView,
  SplitViewMain,
  SplitViewSide,
} from "@director.run/design/components/split-view.tsx";
import { ToolList } from "@director.run/design/components/tools/tool-list.tsx";
import type {
  MCPTool,
  PlaybookDetail,
} from "@director.run/design/components/types.ts";
import { ConfirmDialog } from "@director.run/design/components/ui/confirm-dialog.tsx";
import { Container } from "@director.run/design/components/ui/container.tsx";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@director.run/design/components/ui/section.tsx";
import { Tab, Tabs } from "@director.run/design/components/ui/tabs.tsx";
import { toast } from "@director.run/design/components/ui/toast.tsx";
import { DesktopIcon, NotebookIcon, ToolboxIcon } from "@phosphor-icons/react";
import { useState } from "react";
import type { KitchenSinkNavigate, KitchenSinkPageState } from "../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const slugify = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, "-") || "prompt";

interface PlaybookDetailRouteProps {
  playbook: PlaybookDetail;
  tools: MCPTool[];
  connectionInfo: ConnectionInfo;
  navigate: KitchenSinkNavigate;
  pageState: KitchenSinkPageState;
  onMutate: (updater: (playbook: PlaybookDetail) => PlaybookDetail) => void;
  onDelete: () => void;
}

export function PlaybookDetailRoute({
  playbook,
  tools,
  connectionInfo,
  navigate,
  pageState,
  onMutate,
  onDelete,
}: PlaybookDetailRouteProps) {
  if (pageState === "loading") {
    return <PlaybookSkeleton />;
  }

  if (pageState === "error") {
    return (
      <FullScreenError
        icon="dead-smiley"
        fullScreen={true}
        title="Unexpected Error"
        subtitle="Something went wrong loading this playbook."
      />
    );
  }

  return (
    <>
      <LayoutBreadcrumbHeader breadcrumbs={[{ title: playbook.name }]}>
        <PlaybookEditMenu
          playbook={playbook}
          onMutate={onMutate}
          onDelete={onDelete}
        />
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
                          navigate({
                            name: "target",
                            playbookId: playbook.id,
                            targetId: server.name,
                          })
                        }
                        onClickAddServer={() => navigate({ name: "library" })}
                        onClickAuthorize={async (server) => {
                          await delay(400);
                          toast({
                            title: "Authenticating",
                            description: `Would start OAuth for ${server.name}.`,
                          });
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
                        toolsLoading={false}
                        editable={true}
                        onUpdateTools={async () => {
                          await delay(600);
                          toast({
                            title: "Tools updated",
                            description: "Your tools have been updated.",
                          });
                        }}
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
                        onCreatePrompt={async (values) => {
                          await delay(400);
                          onMutate((current) => ({
                            ...current,
                            prompts: [
                              ...(current.prompts ?? []),
                              {
                                name: slugify(values.title),
                                title: values.title,
                                description: values.description,
                                body: values.body,
                              },
                            ],
                          }));
                          toast({
                            title: "Prompt saved",
                            description: "Your prompt was saved.",
                          });
                        }}
                        onEditPrompt={async (promptName, values) => {
                          await delay(400);
                          onMutate((current) => ({
                            ...current,
                            prompts: (current.prompts ?? []).map((prompt) =>
                              prompt.name === promptName
                                ? { ...prompt, ...values }
                                : prompt,
                            ),
                          }));
                          toast({
                            title: "Prompt updated",
                            description: "Your prompt was updated.",
                          });
                        }}
                        onDeletePrompt={async (promptName) => {
                          await delay(400);
                          onMutate((current) => ({
                            ...current,
                            prompts: (current.prompts ?? []).filter(
                              (prompt) => prompt.name !== promptName,
                            ),
                          }));
                          toast({
                            title: "Prompt deleted",
                            description: "Your prompt was deleted.",
                          });
                        }}
                      />
                    }
                  />
                </Tabs>
              </Section>
            </SplitViewMain>
            <SplitViewSide>
              <PlaybookSectionConnect
                connectionInfo={connectionInfo}
                isLoading={false}
              />
            </SplitViewSide>
          </SplitView>
        </Container>
      </LayoutViewContent>
    </>
  );
}

function PlaybookEditMenu({
  playbook,
  onMutate,
  onDelete,
}: {
  playbook: PlaybookDetail;
  onMutate: (updater: (playbook: PlaybookDetail) => PlaybookDetail) => void;
  onDelete: () => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleUpdate = async (values: PlaybookFormData) => {
    await delay(400);
    onMutate((current) => ({
      ...current,
      name: values.name,
      description: values.description ?? "",
    }));
    toast({
      title: "Playbook updated",
      description: "This playbook was successfully updated.",
    });
    setSettingsOpen(false);
  };

  const handleDelete = async () => {
    await delay(400);
    toast({
      title: "Playbook deleted",
      description: "This playbook was successfully deleted.",
    });
    setDeleteOpen(false);
    onDelete();
  };

  return (
    <>
      <PlaybookActionsDropdown
        onSettingsClick={() => setSettingsOpen(true)}
        onDeleteClick={() => setDeleteOpen(true)}
      />
      <PlaybookSettingsSheet
        playbook={playbook}
        onSubmit={handleUpdate}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
      <ConfirmDialog
        title="Delete playbook?"
        description="Are you sure you want to delete this playbook? This action cannot be undone."
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
      />
    </>
  );
}
