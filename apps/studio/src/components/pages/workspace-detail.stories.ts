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
const mockClients = [
  {
    id: "claude",
    label: "Claude",
    image: "/icons/claude-icon.png",
    type: "installer" as const,
  },
  {
    id: "cursor",
    label: "Cursor",
    image: "/icons/cursor-icon.png",
    type: "installer" as const,
  },
  {
    id: "raycast",
    label: "Raycast",
    image: "/icons/raycast-icon.png",
    type: "deep-link" as const,
  },
  {
    id: "code",
    label: "VS Code",
    image: "/icons/code-icon.png",
    type: "installer" as const,
  },
  {
    id: "goose",
    label: "Goose",
    image: "/icons/goose-icon.png",
    type: "deep-link" as const,
  },
];

const mockInstallers: Record<string, boolean> = {
  claude: true,
  cursor: false,
  raycast: true,
  code: false,
  goose: false,
};

const mockAvailableClients = [
  {
    name: "claude",
    installed: true,
  },
  {
    name: "cursor",
    installed: true,
  },
  {
    name: "raycast",
    installed: true,
  },
  {
    name: "code",
    installed: true,
  },
  {
    name: "goose",
    installed: false,
  },
];

const mockToolLinks = [
  {
    title: "search_repositories",
    subtitle: "Search for repositories on GitHub",
    scroll: false,
    href: "/dev-proxy/mcp/github-mcp#search_repositories",
  },
  {
    title: "get_repository",
    subtitle: "Get details about a specific repository",
    scroll: false,
    href: "/dev-proxy/mcp/github-mcp#get_repository",
  },
  {
    title: "create_issue",
    subtitle: "Create a new issue in a repository",
    scroll: false,
    href: "/dev-proxy/mcp/github-mcp#create_issue",
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
    toolLinks: mockToolLinks,
    toolsLoading: false,
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
    clients: mockClients,
    installers: {
      claude: true,
      cursor: true,
      raycast: true,
      code: true,
      goose: true,
    },
    availableClients: mockAvailableClients.map((client) => ({
      ...client,
      installed: true,
    })),
  },
};

export const NoClientsInstalled: Story = {
  args: {
    ...Default.args,
    clients: mockClients,
    installers: {
      claude: false,
      cursor: false,
      raycast: false,
      code: false,
      goose: false,
    },
    availableClients: mockAvailableClients.map((client) => ({
      ...client,
      installed: true,
    })),
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
