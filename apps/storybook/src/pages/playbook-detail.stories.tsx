import { WorkspaceSectionClients } from "@director.run/design/components/playbooks-clients/playbook-section-clients.tsx";
import { PromptList } from "@director.run/design/components/prompts/prompt-list.tsx";
import { WorkspaceServerList } from "@director.run/design/components/servers/server-list.tsx";
import {
  SplitView,
  SplitViewMain,
  SplitViewSide,
} from "@director.run/design/components/split-view.tsx";
import { ToolList } from "@director.run/design/components/tools/tool-list.tsx";
import type {
  Client,
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
import { mockClients } from "@director.run/design/test/fixtures/playbook/clients.ts";
import { mockPlaybook } from "@director.run/design/test/fixtures/playbook/playbook.ts";
import { DesktopIcon, NotebookIcon, ToolboxIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

const WorkspaceDetailComponent = ({
  playbook,
  tools,
  clients,
}: {
  playbook: PlaybookDetail;
  clients: Client[];
  tools: MCPTool[];
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
                <WorkspaceServerList
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
        <WorkspaceSectionClients
          playbook={playbook}
          gatewayBaseUrl={"https://some.url.com"}
          clients={clients ?? []}
          onChangeInstall={() => console.log("change install")}
          isLoading={false}
        />
      </SplitViewSide>
    </SplitView>
  </Container>
);

const meta = {
  title: "pages/playbooks/detail",
  component: WorkspaceDetailComponent,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof WorkspaceDetailComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    playbook: mockPlaybook(),
    clients: mockClients,
    tools: mockTools(),
  },
};
