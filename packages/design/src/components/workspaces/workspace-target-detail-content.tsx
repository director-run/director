import { McpLogo } from "@director.run/design/components/mcp-logo.tsx";
import { WorkspaceTargetPropertyList } from "@director.run/design/components/mcp-servers/workspace-target-property-list.tsx";
import { RegistryEntryReadme } from "@director.run/design/components/registry/registry-entry-readme.tsx";
import { ToolList } from "@director.run/design/components/tools/tool-list.js";
import type {
  MCPTool,
  RegistryEntryDetail,
  WorkspaceTarget,
} from "@director.run/design/components/types.js";
import type { WorkspaceDetail } from "@director.run/design/components/types.js";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { Markdown } from "@director.run/design/components/ui/markdown.tsx";
import { Section } from "@director.run/design/components/ui/section.tsx";
import { SectionHeader } from "@director.run/design/components/ui/section.tsx";
import { SectionTitle } from "@director.run/design/components/ui/section.tsx";
import { SectionDescription } from "@director.run/design/components/ui/section.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@director.run/design/components/ui/tabs.tsx";
import {
  BookOpenTextIcon,
  HardDriveIcon,
  ToolboxIcon,
} from "@phosphor-icons/react";

export function WorkspaceTargetDetailContent({
  workspaceTarget,
  workspace,
  registryEntry,
  navigate,
  workspaceId,
  tools,
  toolsLoading,
}: WorkspaceTargetDetailContentProps) {
  return (
    <Container size="lg">
      <Section className="gap-y-8">
        <McpLogo src={registryEntry?.icon} className="size-9" />
        <SectionHeader>
          <SectionTitle>{workspaceTarget.name}</SectionTitle>
          <SectionDescription>
            Installed on{" "}
            <button
              onClick={() => navigate(`/${workspaceId}`)}
              className="cursor-pointer text-fg underline"
            >
              {workspace?.name}
            </button>
          </SectionDescription>
        </SectionHeader>

        {registryEntry?.description ? (
          <Markdown>{registryEntry?.description}</Markdown>
        ) : null}
      </Section>

      <Tabs defaultValue="tools">
        <TabsList>
          <TabsTrigger value="readme">
            <BookOpenTextIcon /> Readme
          </TabsTrigger>
          <TabsTrigger value="tools">
            <ToolboxIcon /> Tools
          </TabsTrigger>
          <TabsTrigger value="properties">
            <HardDriveIcon /> Properties
          </TabsTrigger>
        </TabsList>

        <TabsContent value="readme">
          <RegistryEntryReadme readme={registryEntry?.readme ?? null} />
        </TabsContent>

        <TabsContent value="tools">
          <ToolList tools={tools as MCPTool[]} toolsLoading={toolsLoading} />
        </TabsContent>

        <TabsContent value="properties">
          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h3>Transport Configuration</h3>
              </SectionTitle>
            </SectionHeader>
            <WorkspaceTargetPropertyList target={workspaceTarget} />
          </Section>
        </TabsContent>
      </Tabs>
    </Container>
  );
}

type WorkspaceTargetDetailContentProps = {
  workspaceTarget: WorkspaceTarget;
  workspace: WorkspaceDetail;
  registryEntry?: RegistryEntryDetail;
  navigate: (path: string) => void;
  workspaceId: string;
  tools: MCPTool[];
  toolsLoading: boolean;
};
