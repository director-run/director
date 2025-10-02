import type { Client } from "@director.run/design/components/proxies/proxy-installers.js";
import type {
  ConfiguratorTarget,
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
  clients,
  tools,
}: {
  workspace: WorkspaceDetail;
  clients: Client[];
  tools: McpSdkTool[];
}) => (
  <WorkspaceDetailContent
    workspace={workspace}
    clients={clients}
    tools={tools as MCPTool[]}
    isClientsLoading={false}
    isChanging={false}
    toolsLoading={false}
    gatewayBaseUrl={"https://some.url.com"}
    onChangeInstall={async (client: ConfiguratorTarget, install: boolean) => {
      await console.log(client, install);
    }}
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
