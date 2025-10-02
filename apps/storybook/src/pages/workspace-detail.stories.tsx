import {
  SplitView,
  SplitViewMain,
  SplitViewSide,
} from "@director.run/design/components/split-view.tsx";
import type {
  Client,
  MCPTool,
  WorkspaceDetail,
} from "@director.run/design/components/types.ts";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { WorkspaceDetailContent } from "@director.run/design/components/workspaces/workspace-detail-content.tsx";
import { WorkspaceSectionClients } from "@director.run/design/components/workspaces/workspace-section-clients.tsx";
import { mockTools } from "@director.run/design/test/fixtures/mcp/tools.js";
import { mockClients } from "@director.run/design/test/fixtures/workspace/clients.ts";
import { mockWorkspace } from "@director.run/design/test/fixtures/workspace/workspace.ts";
import type { Tool as McpSdkTool } from "@modelcontextprotocol/sdk/types.js";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

const WorkspaceDetailComponent = ({
  workspace,
  tools,
  clients,
}: {
  workspace: WorkspaceDetail;
  clients: Client[];
  tools: McpSdkTool[];
}) => (
  <Container size="xl">
    <SplitView>
      <SplitViewMain>
        <WorkspaceDetailContent
          workspace={workspace}
          tools={tools as MCPTool[]}
          toolsLoading={false}
          onClickServer={() => console.log("library click")}
          onClickAddServer={() => console.log("server click")}
        />
      </SplitViewMain>
      <SplitViewSide>
        <WorkspaceSectionClients
          workspace={workspace}
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
  title: "pages/workspaces/detail",
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
    workspace: mockWorkspace(),
    clients: mockClients,
    tools: mockTools as McpSdkTool[],
  },
};
