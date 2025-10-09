import type { MCPTool } from "@director.run/design/components/types.ts";
import { Section } from "@director.run/design/components/ui/section.tsx";
import { SectionHeader } from "@director.run/design/components/ui/section.tsx";
import { SectionTitle } from "@director.run/design/components/ui/section.tsx";
import { SectionDescription } from "@director.run/design/components/ui/section.tsx";
import { DesktopIcon, NotebookIcon, ToolboxIcon } from "@phosphor-icons/react";
import { PromptList } from "../prompts/prompt-list";
import { WorkspaceServerList } from "../servers/server-list";
import { ToolList } from "../tools/tool-list";
import type { WorkspaceDetail, WorkspaceTarget } from "../types";
import { Tab, Tabs } from "../ui/tabs";

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
  onDeletePrompt,
}: WorkspaceDetailContentProps) => {
  return (
    <Section className="gap-y-8">
      <SectionHeader>
        <SectionTitle>{workspace.name}</SectionTitle>
        <SectionDescription>{workspace.description}</SectionDescription>
      </SectionHeader>

      <Tabs default="tools">
        <Tab
          id="servers"
          label="Servers"
          icon={<DesktopIcon />}
          content={
            <WorkspaceServerList
              servers={workspace.servers}
              onClickServer={onClickServer}
              onClickAddServer={onClickAddServer}
              onClickAuthorize={onClickAuthorize}
            />
          }
        />
        <Tab
          id="tools"
          label="Tools"
          icon={<ToolboxIcon />}
          content={
            <ToolList tools={tools as MCPTool[]} toolsLoading={toolsLoading} />
          }
        />
        <Tab
          id="prompts"
          label="Prompts"
          icon={<NotebookIcon />}
          content={
            <PromptList
              prompts={workspace.prompts ?? []}
              onCreatePrompt={onCreatePrompt}
              onEditPrompt={onEditPrompt}
              onDeletePrompt={onDeletePrompt}
              isSavingPrompt={isSavingPrompt}
            />
          }
        />
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
  onDeletePrompt?: (promptName: string) => Promise<void> | void;
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
