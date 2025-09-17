import { RegistryDetailSidebar } from "@director.run/studio/components/registry-detail-sidebar.tsx";
import { RegistryItem } from "@director.run/studio/components/registry-item.tsx";
import { RegistryToolSheet } from "@director.run/studio/components/registry/registry-tool-sheet.tsx";
import {
  SplitView,
  SplitViewMain,
  SplitViewSide,
} from "@director.run/studio/components/split-view.tsx";
import type { StoreGetAll } from "@director.run/studio/components/types.ts";
import { Container } from "@director.run/studio/components/ui/container.tsx";
import { mockRegistryEntry } from "@director.run/studio/test/fixtures/registry/entry.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { withLayoutView } from "../helpers/decorators";

const mockProxies: StoreGetAll = [
  {
    id: "dev-proxy",
    name: "Development Proxy",
    description: "Main development proxy",
    prompts: undefined,
    targets: [],
    servers: [],
    path: "/ws/dev-proxy",
  },
  {
    id: "staging-proxy",
    name: "Staging Proxy",
    description: "Staging environment proxy",
    prompts: undefined,
    targets: [],
    servers: [],
    path: "/ws/staging-proxy",
  },
];

const RegistryItemDetailComponent = ({
  entry,
  proxies,
  entryInstalledOn,
  onClickInstall,
  isInstalling,
  onToolClick,
  onProxyServerClick,
}: {
  entry: typeof mockRegistryEntry;
  proxies?: StoreGetAll;
  entryInstalledOn?: string[];
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
        <RegistryItem entry={entry} onToolClick={onToolClick} />
      </SplitViewMain>
      <SplitViewSide>
        <RegistryDetailSidebar
          entry={entry}
          proxies={proxies}
          entryInstalledOn={entryInstalledOn}
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
    proxies: mockProxies,
    entryInstalledOn: ["dev-proxy"],
    onClickInstall: async (values) => {
      console.log("Installing MCP server:", values);
      // Simulate installation delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    isInstalling: false,
  },
};

export const WithToolSelected: Story = {
  args: {
    ...Default.args,
  },
  render: (args) => {
    const [selectedToolName, setSelectedToolName] = useState<string | null>(
      mockRegistryEntry.tools?.[0]?.name ?? null,
    );
    const selectedTool = mockRegistryEntry.tools?.find(
      (t) => t.name === selectedToolName,
    );

    return (
      <>
        <Container size="xl">
          <SplitView>
            <SplitViewMain>
              <RegistryItem
                entry={mockRegistryEntry}
                onToolClick={(tool) => setSelectedToolName(tool.name)}
              />
            </SplitViewMain>
            <SplitViewSide>
              <RegistryDetailSidebar
                entry={mockRegistryEntry}
                proxies={mockProxies}
                entryInstalledOn={["dev-proxy"]}
                onClickInstall={args.onClickInstall || (async () => {})}
                isInstalling={args.isInstalling || false}
              />
            </SplitViewSide>
          </SplitView>
        </Container>
        {selectedTool && (
          <RegistryToolSheet
            tool={selectedTool}
            mcpName={mockRegistryEntry.title}
            onClose={() => setSelectedToolName(null)}
          />
        )}
      </>
    );
  },
};
