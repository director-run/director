import { ConfiguratorTarget } from "@director.run/client-configurator/index";
import type { Meta, StoryObj } from "@storybook/react";
import { ProxyDetail } from "./workspace-detail";

const meta = {
  title: "pages/ProxyDetail",
  component: ProxyDetail,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ProxyDetail>;

// eslint-disable-next-line import/no-default-export
export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for proxy
const mockProxy = {
  id: "dev-proxy",
  name: "Development Proxy",
  description: "Main development proxy for local development and testing",
  servers: [
    { name: "github-mcp" },
    { name: "filesystem-mcp" },
    { name: "sqlite-mcp" },
    { name: "brave-search-mcp" },
  ],
};

const mockProxyWithManyServers = {
  id: "production-proxy",
  name: "Production Proxy",
  description:
    "Production environment proxy with comprehensive MCP server setup",
  servers: [
    { name: "github-mcp" },
    { name: "filesystem-mcp" },
    { name: "sqlite-mcp" },
    { name: "brave-search-mcp" },
    { name: "postgres-mcp" },
    { name: "notion-mcp" },
    { name: "slack-mcp" },
    { name: "figma-mcp" },
    { name: "airtable-mcp" },
    { name: "google-drive-mcp" },
    { name: "linear-mcp" },
    { name: "jira-mcp" },
  ],
};

const mockProxyEmpty = {
  id: "new-proxy",
  name: "New Proxy",
  description: "A newly created proxy with no MCP servers installed yet",
  servers: [],
};

// Mock clients data
const mockClients: Array<{
  id: string;
  name: string;
  description: string;
  icon: string;
  isInstalled: boolean;
  isAvailable: boolean;
}> = [
  {
    id: "claude",
    name: "Claude",
    description: "Anthropic's Claude AI assistant",
    icon: "/icons/claude-icon.png",
    isInstalled: true,
    isAvailable: true,
  },
  {
    id: "cursor",
    name: "Cursor",
    description: "AI-powered code editor",
    icon: "/icons/cursor-icon.png",
    isInstalled: false,
    isAvailable: true,
  },
  {
    id: "raycast",
    name: "Raycast",
    description: "Mac productivity tool",
    icon: "/icons/raycast-icon.png",
    isInstalled: true,
    isAvailable: true,
  },
  {
    id: "code",
    name: "VS Code",
    description: "Visual Studio Code editor",
    icon: "/icons/code-icon.png",
    isInstalled: false,
    isAvailable: true,
  },
  {
    id: "goose",
    name: "Goose",
    description: "AI coding assistant",
    icon: "/icons/goose-icon.png",
    isInstalled: false,
    isAvailable: false,
  },
];

const mockInstallers: Record<string, boolean> = {
  claude: true,
  cursor: false,
  raycast: true,
  code: false,
  goose: false,
};

const mockAvailableClients: Array<{
  id: string;
  name: string;
  description: string;
  icon: string;
}> = [
  {
    id: "claude",
    name: "Claude",
    description: "Anthropic's Claude AI assistant",
    icon: "/icons/claude-icon.png",
  },
  {
    id: "cursor",
    name: "Cursor",
    description: "AI-powered code editor",
    icon: "/icons/cursor-icon.png",
  },
  {
    id: "raycast",
    name: "Raycast",
    description: "Mac productivity tool",
    icon: "/icons/raycast-icon.png",
  },
  {
    id: "code",
    name: "VS Code",
    description: "Visual Studio Code editor",
    icon: "/icons/code-icon.png",
  },
];

export const Default: Story = {
  args: {
    proxy: mockProxy,
    clients: mockClients,
    installers: mockInstallers,
    availableClients: mockAvailableClients,
    isClientsLoading: false,
    onInstall: async (proxyId: string, client: ConfiguratorTarget) => {
      console.log("Installing client:", client, "on proxy:", proxyId);
      // Simulate installation delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    onUninstall: async (proxyId: string, client: ConfiguratorTarget) => {
      console.log("Uninstalling client:", client, "from proxy:", proxyId);
      // Simulate uninstallation delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
    },
    isInstalling: false,
    isUninstalling: false,
  },
};

export const WithManyServers: Story = {
  args: {
    ...Default.args,
    proxy: mockProxyWithManyServers,
  },
};

export const EmptyProxy: Story = {
  args: {
    ...Default.args,
    proxy: mockProxyEmpty,
  },
};

export const LoadingClients: Story = {
  args: {
    ...Default.args,
    isClientsLoading: true,
  },
};

export const InstallingClient: Story = {
  args: {
    ...Default.args,
    isInstalling: true,
  },
};

export const UninstallingClient: Story = {
  args: {
    ...Default.args,
    isUninstalling: true,
  },
};

export const NoAvailableClients: Story = {
  args: {
    ...Default.args,
    availableClients: [],
  },
};

export const AllClientsInstalled: Story = {
  args: {
    ...Default.args,
    clients: mockClients.map((client) => ({
      ...client,
      isInstalled: true,
    })),
    installers: {
      claude: true,
      cursor: true,
      raycast: true,
      code: true,
      goose: true,
    },
  },
};

export const NoClientsInstalled: Story = {
  args: {
    ...Default.args,
    clients: mockClients.map((client) => ({
      ...client,
      isInstalled: false,
    })),
    installers: {
      claude: false,
      cursor: false,
      raycast: false,
      code: false,
      goose: false,
    },
  },
};

export const LongDescription: Story = {
  args: {
    ...Default.args,
    proxy: {
      ...mockProxy,
      description:
        "This is a very long description for the development proxy that explains its purpose, configuration, and usage in great detail. It should wrap nicely in the UI and provide comprehensive information about what this proxy is used for and how it's configured.",
    },
  },
};

export const NoDescription: Story = {
  args: {
    ...Default.args,
    proxy: {
      ...mockProxy,
      description: undefined,
    },
  },
};
