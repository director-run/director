import { RegistryItemDetail } from "@director.run/studio/components/pages/registry-item-detail.tsx";
import type { Meta, StoryObj } from "@storybook/react";
import {
  mockEntry,
  mockProxiesWithMcp,
  mockProxiesWithoutMcp,
  mockRegistryEntry,
} from "../fixtures";

const meta = {
  title: "pages/RegistryItemDetail",
  component: RegistryItemDetail,
  parameters: {
    layout: "fullscreen",
  },
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
    toolLinks: [
      {
        title: "search_repositories",
        subtitle: "Search for repositories on GitHub",
        scroll: false,
        href: "#search_repositories",
      },
      {
        title: "get_repository",
        subtitle: "Get details about a specific repository",
        scroll: false,
        href: "#get_repository",
      },
      {
        title: "create_issue",
        subtitle: "Create a new issue in a repository",
        scroll: false,
        href: "#create_issue",
      },
    ],
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
    selectedTool: mockEntry.tools?.[0],
  },
};
