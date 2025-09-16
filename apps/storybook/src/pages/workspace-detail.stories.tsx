import { WorkspaceDetail } from "@director.run/studio/components/pages/workspace-detail.tsx";
import type { ConfiguratorTarget } from "@director.run/studio/components/types.ts";
import { mockWorkspace } from "@director.run/studio/test/fixtures/workspace/workspace.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

const meta = {
  title: "pages/workspaces/detail",
  component: WorkspaceDetail,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof WorkspaceDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

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
    workspace: mockWorkspace,
    gatewayBaseUrl: "http://localhost:3673",
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
