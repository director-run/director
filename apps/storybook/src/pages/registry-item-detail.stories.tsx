import { RegistryItemDetail } from "@director.run/studio/components/pages/registry-item-detail.tsx";
import { RegistryToolSheet } from "@director.run/studio/components/registry/registry-tool-sheet.tsx";
import type { StoreGetAll } from "@director.run/studio/components/types.ts";
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

const meta = {
  title: "pages/registry/detail",
  component: RegistryItemDetail,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof RegistryItemDetail>;

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
        <RegistryItemDetail
          {...args}
          entry={mockRegistryEntry}
          proxies={mockProxies}
          entryInstalledOn={["dev-proxy"]}
          onToolClick={(tool) => setSelectedToolName(tool.name)}
        />
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
