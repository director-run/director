import { RegistryItemDetail } from "@director.run/studio/components/pages/registry-item-detail.tsx";
import type { Meta, StoryObj } from "@storybook/react";
import { mockProxiesWithMcp, mockProxiesWithoutMcp } from "../fixtures";

import { mockRegistryEntry } from "../../fixtures/registry/entry";

const meta = {
  title: "pages/RegistryItemDetail",
  component: RegistryItemDetail,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div id="main-layout">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RegistryItemDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    entry: mockRegistryEntry,
    proxiesWithMcp: mockProxiesWithMcp,
    proxiesWithoutMcp: mockProxiesWithoutMcp,
    defaultProxyId: "production-proxy",
    serverId: "production-proxy",
    toolLinks:
      mockRegistryEntry?.tools?.map((tool) => ({
        title: tool.name,
        subtitle: tool.description,
        scroll: false,
        href: `#${tool.name}`,
      })) || [],
    onInstall: async (values) => {
      console.log("Installing MCP server:", values);
      // Simulate installation delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    isInstalling: false,
    onCloseTool: () => {
      console.log("Closing tool sheet");
    },
  },
};

export const WithToolSelected: Story = {
  args: {
    ...Default.args,
    selectedTool: mockRegistryEntry.tools?.[0],
  },
};
