import { WorkspaceTargetDetail } from "@director.run/studio/components/pages/workspace-target-detail.tsx";
import type { StoreServerTransport } from "@director.run/studio/components/types.ts";
import { mockRegistryEntry } from "@director.run/studio/test/fixtures/registry/entry.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

const meta = {
  title: "pages/workspaces/target-detail",
  component: WorkspaceTargetDetail,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof WorkspaceTargetDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockMcp = {
  name: "github-mcp",
  transport: {
    type: "stdio" as const,
    command: "npx",
    args: ["@modelcontextprotocol/server-github"],
    env: {
      GITHUB_TOKEN: "ghp_xxxxxxxxxxxxxxxxxxxx",
    },
  } as StoreServerTransport,
};

const mockProxy = {
  id: "dev-proxy",
  name: "Development Proxy",
};

const mockDescription =
  "A comprehensive GitHub integration that provides tools to interact with repositories, issues, pull requests, and more through the Model Context Protocol.";

// Different transport types for variety
const mockHttpTransport: StoreServerTransport = {
  type: "http",
  url: "https://api.github.com/mcp",
};

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
    mcp: mockMcp,
    proxy: mockProxy,
    entryData: mockRegistryEntry,
    description: mockDescription,
    toolLinks: mockToolLinks,
    toolsLoading: false,
  },
};

export const WithHttpTransport: Story = {
  args: {
    ...Default.args,
    mcp: {
      ...mockMcp,
      transport: mockHttpTransport,
    },
  },
};
export const SparselyPopulated: Story = {
  args: {
    ...Default.args,
    description: null,
    entryData: {
      ...mockRegistryEntry,
      icon: null,
      readme: null,
    },
  },
};

export const LongStrings: Story = {
  args: {
    ...Default.args,
    proxy: {
      id: "very-long-proxy-name-that-should-wrap",
      name: "Very Long Proxy Name That Should Wrap Nicely in the UI",
    },
    description:
      "This is a very long description that explains in great detail what this MCP server does, how it works, what features it provides, and how to use it effectively. It should wrap nicely in the UI and provide comprehensive information about the server's capabilities and usage patterns. The description covers all the important aspects that users need to know when working with this particular MCP server implementation.",
  },
};
