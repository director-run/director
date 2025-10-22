import { McpLogo } from "@director.run/design/components/mcp-logo.tsx";
import { PlaybookTargetPropertyList } from "@director.run/design/components/mcp-servers/playbook-target-property-list.tsx";
import { RegistryEntryReadme } from "@director.run/design/components/registry/registry-entry-readme.tsx";
import { ToolList } from "@director.run/design/components/tools/tool-list.js";
import type {
  MCPTool,
  PlaybookTarget,
  RegistryEntryDetail,
} from "@director.run/design/components/types.js";
import type { PlaybookDetail } from "@director.run/design/components/types.js";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { Markdown } from "@director.run/design/components/ui/markdown.tsx";
import { Section } from "@director.run/design/components/ui/section.tsx";
import { SectionHeader } from "@director.run/design/components/ui/section.tsx";
import { SectionTitle } from "@director.run/design/components/ui/section.tsx";
import { SectionDescription } from "@director.run/design/components/ui/section.tsx";
import { Tab, Tabs } from "@director.run/design/components/ui/tabs.tsx";
import { mockTools } from "@director.run/design/test/fixtures/mcp/tools.ts";
import { mockPlaybookTarget } from "@director.run/design/test/fixtures/playbook/playbook-target.ts";
import { mockPlaybook } from "@director.run/design/test/fixtures/playbook/playbook.ts";
import { mockRegistryEntry } from "@director.run/design/test/fixtures/registry/entry.ts";
import {
  BookOpenTextIcon,
  HardDriveIcon,
  ToolboxIcon,
} from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

type PlaybookTargetDetailContentProps = {
  playbookTarget: PlaybookTarget;
  playbook: PlaybookDetail;
  registryEntry?: RegistryEntryDetail;
  navigate: (path: string) => void;
  playbookId: string;
  tools: MCPTool[];
  toolsLoading: boolean;
};

function PlaybookTargetDetailContent({
  playbookTarget,
  playbook,
  registryEntry,
  navigate,
  playbookId,
  tools,
  toolsLoading,
}: PlaybookTargetDetailContentProps) {
  return (
    <Container size="lg">
      <Section className="gap-y-8">
        <McpLogo src={registryEntry?.icon} className="size-9" />
        <SectionHeader>
          <SectionTitle>{playbookTarget.name}</SectionTitle>
          <SectionDescription>
            Installed on{" "}
            <button
              onClick={() => navigate(`/${playbookId}`)}
              className="cursor-pointer text-fg underline"
            >
              {playbook?.name}
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
              <PlaybookTargetPropertyList target={playbookTarget} />
            </Section>
          }
        />
      </Tabs>
    </Container>
  );
}

const meta = {
  title: "pages/playbooks/target-detail",
  component: PlaybookTargetDetailContent,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof PlaybookTargetDetailContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    playbookTarget: mockPlaybookTarget,
    playbook: mockPlaybook(),
    registryEntry: mockRegistryEntry,
    tools: mockTools(),
    toolsLoading: false,
    navigate: () => console.log("navigate"),
    playbookId: "playbook-id",
  },
};

export const WithHttpTransport: Story = {
  args: {
    ...Default.args,
    playbookTarget: {
      ...mockPlaybookTarget,
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
    playbook: {
      ...mockPlaybook(),
      id: "very-long-playbook-name-that-should-wrap",
      name: "Very Long Playbook Name That Should Wrap Nicely in the UI",
    },
  },
};
