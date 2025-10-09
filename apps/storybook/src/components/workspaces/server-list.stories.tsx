import { WorkspaceServerList } from "@director.run/design/components/servers/server-list.js";
import type {
  Client,
  MCPTool,
  WorkspaceDetail,
} from "@director.run/design/components/types.ts";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { mockTools } from "@director.run/design/test/fixtures/mcp/tools.js";
import { mockClients } from "@director.run/design/test/fixtures/workspace/clients.ts";
import { mockWorkspace } from "@director.run/design/test/fixtures/workspace/workspace.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../../helpers/decorators";

const WorkspaceDetailComponent = ({
  workspace,
}: {
  workspace: WorkspaceDetail;
  clients: Client[];
  tools: MCPTool[];
}) => (
  <Container size="lg">
    <WorkspaceServerList
      servers={workspace.servers}
      onClickServer={(server) => console.log(server)}
    />
  </Container>
);

const meta = {
  title: "components/workspaces/server-list",
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
    tools: mockTools(),
  },
};
