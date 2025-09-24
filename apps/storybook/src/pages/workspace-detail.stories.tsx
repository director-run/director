import type { Client } from "@director.run/design/components/proxies/proxy-installers.js";
import { WorkspaceSectionClients } from "@director.run/design/components/proxies/workspace-section-clients.tsx";
import { WorkspaceSectionHeader } from "@director.run/design/components/proxies/workspace-section-header.tsx";
import { WorkspaceSectionServers } from "@director.run/design/components/proxies/workspace-section-servers.tsx";
import { WorkspaceSectionTools } from "@director.run/design/components/proxies/workspace-section-tools.tsx";
import type {
  ConfiguratorTarget,
  WorkspaceDetail,
} from "@director.run/design/components/types.ts";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { SectionSeparator } from "@director.run/design/components/ui/section.tsx";
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
  <Container size="lg">
    <WorkspaceSectionHeader workspace={workspace} />
    <SectionSeparator />
    <WorkspaceSectionClients
      workspace={workspace}
      gatewayBaseUrl={"https://some.url.com"}
      clients={clients ?? []}
      isClientsLoading={false}
      onChangeInstall={async (client: ConfiguratorTarget, install: boolean) => {
        await console.log(client, install);
      }}
      isChanging={false}
    />
    <SectionSeparator />
    <WorkspaceSectionServers
      workspace={workspace}
      onLibraryClick={() => console.log("library click")}
      onServerClick={() => console.log("server click")}
    />
    <SectionSeparator />
    <WorkspaceSectionTools
      tools={tools ?? []}
      toolsLoading={false}
      onToolClick={(tool) => console.log(tool)}
    />
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
    workspace: mockWorkspace,
    clients: mockClients,
    tools: mockTools as McpSdkTool[],
  },
};
