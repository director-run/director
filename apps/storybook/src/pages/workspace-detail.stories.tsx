import type {
  Client,
  MCPTool,
  WorkspaceDetail,
} from "@director.run/design/components/types.ts";
import { WorkspaceDetailContent } from "@director.run/design/components/workspaces/workspace-detail-content.tsx";
import { mockTools } from "@director.run/design/test/fixtures/mcp/tools.js";
import { mockClients } from "@director.run/design/test/fixtures/workspace/clients.ts";
import { mockWorkspace } from "@director.run/design/test/fixtures/workspace/workspace.ts";
import type { Tool as McpSdkTool } from "@modelcontextprotocol/sdk/types.js";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

const WorkspaceDetailComponent = ({
  workspace,
  tools,
}: {
  workspace: WorkspaceDetail;
  clients: Client[];
  tools: McpSdkTool[];
}) => (
  <WorkspaceDetailContent
    workspace={workspace}
    tools={tools as MCPTool[]}
    toolsLoading={false}
    onClickServer={() => console.log("library click")}
    onClickAddServer={() => console.log("server click")}
  />
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
