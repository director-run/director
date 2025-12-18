import {
  type ConnectionInfo,
  PlaybookSectionConnect,
} from "@director.run/design/components/playbooks-clients/playbook-section-connect.tsx";
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
import { Container } from "@director.run/design/components/ui/container.tsx";
import { Section } from "@director.run/design/components/ui/section.tsx";
import { SectionHeader } from "@director.run/design/components/ui/section.tsx";
import { SectionTitle } from "@director.run/design/components/ui/section.tsx";
import { SectionDescription } from "@director.run/design/components/ui/section.tsx";
import { Tab, Tabs } from "@director.run/design/components/ui/tabs.tsx";
import { mockTools } from "@director.run/design/test/fixtures/mcp/tools.js";
import { mockPlaybook } from "@director.run/design/test/fixtures/playbook/playbook.ts";
import { DesktopIcon, NotebookIcon, ToolboxIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

const mockConnectionInfo: ConnectionInfo = {
  playbookId: "staging-playbook",
  apiKey: "sk_test_abc123def456ghi789",
  streamableUrl: "https://gateway.director.run/mcp/staging-playbook",
};

const PlaybookDetailComponent = ({
  playbook,
  tools,
  connectionInfo,
}: {
  playbook: PlaybookDetail;
  tools: MCPTool[];
  connectionInfo: ConnectionInfo;
}) => (
  <Container size="xl">
    <SplitView>
      <SplitViewMain>
        <Section className="gap-y-8">
          <SectionHeader>
            <SectionTitle>{playbook.name}</SectionTitle>
            <SectionDescription>{playbook.description}</SectionDescription>
          </SectionHeader>

          <Tabs default="tools">
            <Tab
              id="servers"
              label="Servers"
              icon={<DesktopIcon />}
              content={
                <PlaybookServerList
                  servers={playbook.servers}
                  onClickServer={() => console.log("library click")}
                  onClickAddServer={() => console.log("server click")}
                />
              }
            />
            <Tab
              id="tools"
              label="Tools"
              icon={<ToolboxIcon />}
              content={
                <ToolList tools={tools as MCPTool[]} toolsLoading={false} />
              }
            />
            <Tab
              id="prompts"
              label="Prompts"
              icon={<NotebookIcon />}
              content={<PromptList prompts={playbook.prompts ?? []} />}
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
);

const meta = {
  title: "pages/playbooks/detail",
  component: PlaybookDetailComponent,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof PlaybookDetailComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    playbook: mockPlaybook(),
    tools: mockTools(),
    connectionInfo: mockConnectionInfo,
  },
};
