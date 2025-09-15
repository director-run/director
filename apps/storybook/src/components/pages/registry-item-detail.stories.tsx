import { RegistryItemDetail } from "@director.run/studio/components/pages/registry-item-detail.tsx";
import type { StoreGetAll } from "@director.run/studio/components/types.ts";
import { mockRegistryEntry } from "@director.run/studio/test/fixtures/registry/entry.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../../helpers/decorators";

const mockProxiesWithMcp: StoreGetAll = [
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

const mockProxiesWithoutMcp: StoreGetAll = [
  {
    id: "production-proxy",
    name: "Production Proxy",
    description: "Production environment proxy",
    prompts: undefined,
    targets: [],
    servers: [],
    path: "/ws/production-proxy",
  },
  {
    id: "test-proxy",
    name: "Test Proxy",
    description: "Testing environment proxy",
    prompts: undefined,
    targets: [],
    servers: [],
    path: "/ws/test-proxy",
  },
];

const meta = {
  title: "library/detail",
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
      })) ?? [],
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
