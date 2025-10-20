import { RegistryDetailSidebar } from "@director.run/design/components/registry-detail-sidebar.tsx";
import { RegistryItem } from "@director.run/design/components/registry-item.tsx";
import {
  SplitView,
  SplitViewMain,
  SplitViewSide,
} from "@director.run/design/components/split-view.tsx";
import type { PlaybookList } from "@director.run/design/components/types.ts";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { mockRegistryEntry } from "@director.run/design/test/fixtures/registry/entry.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

const mockPlaybooks: PlaybookList = [
  {
    id: "dev-playbook",
    name: "Development Playbook",
    description: "Main development playbook",
    prompts: undefined,
    servers: [],
    paths: {
      streamable: "/ws/dev-playbook",
      sse: "/ws/dev-playbook",
    },
  },
  {
    id: "staging-playbook",
    name: "Staging Playbook",
    description: "Staging environment playbook",
    prompts: undefined,
    servers: [],
    paths: {
      streamable: "/ws/staging-playbook",
      sse: "/ws/staging-playbook",
    },
  },
];

const RegistryItemDetailComponent = ({
  entry,
  proxies,
  onClickInstall,
  isInstalling,
  onProxyServerClick: _onProxyServerClick,
}: {
  entry: typeof mockRegistryEntry;
  proxies?: PlaybookList;
  onClickInstall: (params: {
    proxyId?: string;
    entryId: string;
    parameters?: Record<string, string>;
  }) => Promise<void>;
  isInstalling?: boolean;
  onToolClick?: (
    tool: NonNullable<typeof mockRegistryEntry.tools>[number],
  ) => void;
  onProxyServerClick?: (proxyId: string, serverName: string) => void;
}) => (
  <Container size="xl">
    <SplitView>
      <SplitViewMain>
        <RegistryItem entry={entry} />
      </SplitViewMain>
      <SplitViewSide>
        <RegistryDetailSidebar
          entry={entry}
          playbooks={proxies}
          onClickInstall={onClickInstall}
          isInstalling={isInstalling}
        />
      </SplitViewSide>
    </SplitView>
  </Container>
);

const meta = {
  title: "pages/registry/detail",
  component: RegistryItemDetailComponent,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof RegistryItemDetailComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    entry: mockRegistryEntry,
    proxies: mockPlaybooks.map((p) =>
      p.id === "dev-playbook"
        ? {
            ...p,
            servers: [
              {
                name: mockRegistryEntry.name,
                type: "stdio",
                command: "npx",
                args: ["-y", "@upstash/context7-mcp"],
                env: {},
              },
            ],
          }
        : { ...p, servers: [] },
    ),
    onClickInstall: async (values) => {
      console.log("Installing MCP server:", values);
      // Simulate installation delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    isInstalling: false,
  },
};
