import type {
  Client,
  ConfiguratorTarget,
  MCPTool,
  WorkspaceDetail,
  WorkspaceTarget,
} from "@director.run/design/components/types.ts";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { SectionSeparator } from "@director.run/design/components/ui/section.tsx";
import { Section } from "@director.run/design/components/ui/section.tsx";
import { SectionHeader } from "@director.run/design/components/ui/section.tsx";
import { SectionTitle } from "@director.run/design/components/ui/section.tsx";
import { SectionDescription } from "@director.run/design/components/ui/section.tsx";
import { WorkspaceServerList } from "@director.run/design/components/workspaces/server-list.tsx";
import {} from "react-router";
import { ToolsList } from "../tools/tool-list";

export const WorkspaceDetailContent = ({
  workspace,
  tools,
  toolsLoading,
  onClickServer,
  onClickAddServer,
}: WorkspaceDetailContentProps) => {
  return (
    <Container size="lg">
      <Section>
        <SectionHeader>
          <SectionTitle>{workspace.name}</SectionTitle>
          <SectionDescription>{workspace.description}</SectionDescription>
        </SectionHeader>
      </Section>
      <SectionSeparator />
      <WorkspaceServerList
        servers={workspace.servers}
        onClickServer={onClickServer}
        onClickAddServer={onClickAddServer}
      />
      <SectionSeparator />
      <ToolsList tools={tools as MCPTool[]} toolsLoading={toolsLoading} />
    </Container>
  );
};

interface WorkspaceDetailContentProps {
  workspace: WorkspaceDetail;
  clients: Client[];
  isClientsLoading: boolean;
  isChanging: boolean;
  tools: MCPTool[];
  toolsLoading: boolean;
  gatewayBaseUrl: string;
  onChangeInstall: (client: ConfiguratorTarget, install: boolean) => void;
  onClickServer: (server: WorkspaceTarget) => void;
  onClickAddServer: () => void;
}
