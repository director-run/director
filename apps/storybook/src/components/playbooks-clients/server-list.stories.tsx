import { PlaybookServerList } from "@director.run/design/components/servers/server-list.js";
import type {
  Client,
  MCPTool,
  PlaybookDetail,
} from "@director.run/design/components/types.ts";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { mockTools } from "@director.run/design/test/fixtures/mcp/tools.js";
import { mockClients } from "@director.run/design/test/fixtures/playbook/clients.ts";
import { mockPlaybook } from "@director.run/design/test/fixtures/playbook/playbook.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../../helpers/decorators";

const PlaybookDetailComponent = ({
  playbook,
}: {
  playbook: PlaybookDetail;
  clients: Client[];
  tools: MCPTool[];
}) => (
  <Container size="lg">
    <PlaybookServerList
      servers={playbook.servers}
      onClickServer={(server) => console.log(server)}
    />
  </Container>
);

const meta = {
  title: "components/playbooks-clients/server-list",
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
    clients: mockClients,
    tools: mockTools(),
  },
};
