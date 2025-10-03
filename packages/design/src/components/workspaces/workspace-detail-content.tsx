import type { MCPTool } from "@director.run/design/components/types.ts";
import { Section } from "@director.run/design/components/ui/section.tsx";
import { SectionHeader } from "@director.run/design/components/ui/section.tsx";
import { SectionTitle } from "@director.run/design/components/ui/section.tsx";
import { SectionDescription } from "@director.run/design/components/ui/section.tsx";
import { WorkspaceServerList } from "@director.run/design/components/workspaces/server-list.tsx";
import { DesktopIcon, NotebookIcon, ToolboxIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { PromptList } from "../prompts/prompt-list";
import { PromptSheet } from "../prompts/prompt-sheet";
import { ToolsList } from "../tools/tool-list";
import type { WorkspaceDetail, WorkspaceTarget } from "../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export const WorkspaceDetailContent = ({
  workspace,
  tools,
  toolsLoading,
  onClickServer,
  onClickAddServer,
  onCreatePrompt,
  onEditPrompt,
  onClickAuthorize,
  isSavingPrompt,
}: WorkspaceDetailContentProps) => {
  return (
    <Section className="gap-y-8">
      <SectionHeader>
        <SectionTitle>{workspace.name}</SectionTitle>
        <SectionDescription>{workspace.description}</SectionDescription>
      </SectionHeader>

      <Tabs defaultValue="servers">
        <TabsList>
          <TabsTrigger value="servers">
            <DesktopIcon /> Servers
          </TabsTrigger>
          <TabsTrigger value="tools">
            <ToolboxIcon /> Tools
          </TabsTrigger>
          <TabsTrigger value="prompts">
            <NotebookIcon /> Prompts
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="servers"
          className="rounded-xl border-[0.5px] bg-accent-subtle/20 p-6"
        >
          <WorkspaceServerList
            servers={workspace.servers}
            onClickServer={onClickServer}
            onClickAddServer={onClickAddServer}
            onClickAuthorize={onClickAuthorize}
          />
        </TabsContent>

        <TabsContent
          value="tools"
          className="rounded-xl border-[0.5px] bg-accent-subtle/20 p-6"
        >
          <ToolsList tools={tools as MCPTool[]} toolsLoading={toolsLoading} />
        </TabsContent>

        <TabsContent
          value="prompts"
          className="rounded-xl border-[0.5px] bg-accent-subtle/20 p-6"
        >
          <WorkspacePrompts
            workspace={workspace}
            onCreatePrompt={onCreatePrompt}
            onEditPrompt={onEditPrompt}
            onClickAuthorize={onClickAuthorize}
            isSavingPrompt={isSavingPrompt}
          />
        </TabsContent>
      </Tabs>
    </Section>
  );
};

interface WorkspaceDetailContentProps {
  workspace: WorkspaceDetail;
  tools: MCPTool[];
  toolsLoading: boolean;
  onClickServer: (server: WorkspaceTarget) => void;
  onClickAddServer?: () => void;
  onClickAuthorize?: (server: WorkspaceTarget) => void;
  onCreatePrompt?: (values: {
    title: string;
    description?: string;
    body: string;
  }) => Promise<void> | void;
  onEditPrompt?: (
    promptName: string,
    values: { title?: string; description?: string; body?: string },
  ) => Promise<void> | void;
  isSavingPrompt?: boolean;
}

function WorkspacePrompts({
  workspace,
  onCreatePrompt,
  onEditPrompt,
  isSavingPrompt = false,
}: {
  workspace: WorkspaceDetail;
  onCreatePrompt?: (values: {
    title: string;
    description?: string;
    body: string;
  }) => Promise<void> | void;
  onEditPrompt?: (
    promptName: string,
    values: { title?: string; description?: string; body?: string },
  ) => Promise<void> | void;
  isSavingPrompt?: boolean;
  onClickAuthorize?: (server: WorkspaceTarget) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<
    NonNullable<WorkspaceDetail["prompts"]>[number] | null
  >(null);

  return (
    <>
      <PromptList
        prompts={workspace.prompts ?? []}
        onClickAddPrompt={() => {
          setSelected(null);
          setOpen(true);
        }}
        onClickPrompt={(p) => {
          setSelected(p);
          setOpen(true);
        }}
      />

      <PromptSheet
        open={open}
        onOpenChange={setOpen}
        prompt={selected}
        isSubmitting={isSavingPrompt}
        onSubmit={async (values) => {
          if (selected && onEditPrompt) {
            await onEditPrompt(selected.name, values);
            setOpen(false);
            return;
          }
          if (onCreatePrompt) {
            await onCreatePrompt(values);
            setOpen(false);
          }
        }}
      />
    </>
  );
}
