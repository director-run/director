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
import { Tab, Tabs } from "@director.run/design/components/ui/tabs.tsx";
import { mockTools } from "@director.run/design/test/fixtures/mcp/tools.ts";
import { mockRegistryEntry } from "@director.run/design/test/fixtures/registry/entry.ts";
import { mockWorkspace } from "@director.run/design/test/fixtures/workspace/workspace.ts";
import { mockWorkspaceTarget } from "@director.run/design/test/fixtures/workspace/worskspace-target.ts";
import {
  BookOpenTextIcon,
  HardDriveIcon,
  ToolboxIcon,
} from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

type WorkspaceTargetDetailContentProps = {
  workspaceTarget: WorkspaceTarget;
  workspace: WorkspaceDetail;
  registryEntry?: RegistryEntryDetail;
  navigate: (path: string) => void;
  workspaceId: string;
  tools: MCPTool[];
  toolsLoading: boolean;
};

function WorkspaceTargetDetailContent({
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

      <Tabs default="tools">
        <Tab
          id="readme"
          label="Readme"
          icon={<BookOpenTextIcon />}
          content={
            <RegistryEntryReadme readme={registryEntry?.readme ?? null} />
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
          id="properties"
          label="Properties"
          icon={<HardDriveIcon />}
          content={
            <Section>
              <SectionHeader>
                <SectionTitle variant="h2" asChild>
                  <h3>Transport Configuration</h3>
                </SectionTitle>
              </SectionHeader>
              <WorkspaceTargetPropertyList target={workspaceTarget} />
            </Section>
          }
        />
      </Tabs>
    </Container>
  );
}

const meta = {
  title: "pages/workspaces/target-detail",
  component: WorkspaceTargetDetailContent,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof WorkspaceTargetDetailContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    workspaceTarget: mockWorkspaceTarget,
    workspace: mockWorkspace(),
    registryEntry: mockRegistryEntry,
    tools: mockTools(),
    toolsLoading: false,
    navigate: () => console.log("navigate"),
    workspaceId: "workspace-id",
  },
};

export const WithHttpTransport: Story = {
  args: {
    ...Default.args,
    workspaceTarget: {
      ...mockWorkspaceTarget,
      type: "http",
      url: "https://api.github.com/mcp",
    },
  },
};
export const SparselyPopulated: Story = {
  args: {
    ...Default.args,
    registryEntry: {
      ...mockRegistryEntry,
      icon: null,
      readme: null,
    },
  },
};

export const LongStrings: Story = {
  args: {
    ...Default.args,
    workspace: {
      ...mockWorkspace(),
      id: "very-long-proxy-name-that-should-wrap",
      name: "Very Long Proxy Name That Should Wrap Nicely in the UI",
    },
  },
};
