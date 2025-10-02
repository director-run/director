import type { MCPTool } from "@director.run/design/components/types.ts";
import { Section } from "@director.run/design/components/ui/section.tsx";
import { SectionHeader } from "@director.run/design/components/ui/section.tsx";
import { SectionTitle } from "@director.run/design/components/ui/section.tsx";
import { SectionDescription } from "@director.run/design/components/ui/section.tsx";
import { WorkspaceServerList } from "@director.run/design/components/workspaces/server-list.tsx";
import { DesktopIcon, ToolboxIcon } from "@phosphor-icons/react";
import { ToolsList } from "../tools/tool-list";
import type { WorkspaceDetail, WorkspaceTarget } from "../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export const WorkspaceDetailContent = ({
  workspace,
  tools,
  toolsLoading,
  onClickServer,
  onClickAddServer,
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
        </TabsList>
        <TabsContent
          value="servers"
          className="flex flex-col gap-y-10 rounded-xl border-[0.5px] bg-accent-subtle/20 p-6"
        >
          <WorkspaceServerList
            servers={workspace.servers}
            onClickServer={onClickServer}
            onClickAddServer={onClickAddServer}
          />
        </TabsContent>

        <TabsContent
          value="tools"
          className="rounded-xl border-[0.5px] bg-accent-subtle/20 p-6"
        >
          <ToolsList tools={tools as MCPTool[]} toolsLoading={toolsLoading} />
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
  onClickAddServer: () => void;
}
