import type { Meta, StoryObj } from "@storybook/react";
import { RegistryGetEntryByName, StoreGetAll } from "../types";
import { RegistryItemDetail } from "./registry-item-detail";

const meta = {
  title: "pages/RegistryItemDetail",
  component: RegistryItemDetail,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof RegistryItemDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for a comprehensive MCP server entry
const mockEntry: RegistryGetEntryByName = {
  id: "github-mcp",
  name: "github-mcp",
  title: "GitHub MCP Server",
  description:
    "A Model Context Protocol server for GitHub that provides tools to interact with repositories, issues, pull requests, and more.",
  icon: "https://github.com/github.png",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  isOfficial: true,
  isEnriched: true,
  isFeatured: false,
  isConnectable: true,
  lastConnectionAttemptedAt: new Date("2024-01-15T10:30:00Z"),
  lastConnectionError: null,
  state: "published",
  githubStarCount: 1250,
  downloadCount: 50000,
  metadata: null,
  source_registry: null,
  categories: ["development", "github", "version-control"],
  homepage:
    "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
  readme: `# GitHub MCP Server

A Model Context Protocol server for GitHub that provides tools to interact with repositories, issues, pull requests, and more.

## Features

- **Repository Management**: Create, clone, and manage repositories
- **Issue Tracking**: Create, update, and search issues
- **Pull Request Management**: Create, review, and merge pull requests
- **Code Search**: Search across repositories and codebases
- **User Management**: Get user information and organization details

## Installation

\`\`\`bash
npm install @modelcontextprotocol/server-github
\`\`\`

## Configuration

Set up your GitHub personal access token:

\`\`\`bash
export GITHUB_TOKEN=your_token_here
\`\`\`

## Usage

The server provides the following tools:
- \`search_repositories\` - Search for repositories
- \`get_repository\` - Get repository details
- \`create_issue\` - Create a new issue
- \`list_issues\` - List repository issues
- \`create_pull_request\` - Create a pull request
- \`get_pull_request\` - Get pull request details

## Examples

### Search for repositories
\`\`\`json
{
  "tool": "search_repositories",
  "arguments": {
    "query": "language:typescript stars:>1000",
    "sort": "stars",
    "order": "desc"
  }
}
\`\`\`

### Create an issue
\`\`\`json
{
  "tool": "create_issue",
  "arguments": {
    "owner": "octocat",
    "repo": "Hello-World",
    "title": "Found a bug",
    "body": "I found a bug in the code"
  }
}
\`\`\`
`,
  tools: [
    {
      name: "search_repositories",
      description: "Search for repositories on GitHub",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query",
          },
          sort: {
            type: "string",
            description: "Sort results by",
          },
          order: {
            type: "string",
            description: "Sort order",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "get_repository",
      description: "Get details about a specific repository",
      inputSchema: {
        type: "object",
        properties: {
          owner: {
            type: "string",
            description: "Repository owner",
          },
          repo: {
            type: "string",
            description: "Repository name",
          },
        },
        required: ["owner", "repo"],
      },
    },
    {
      name: "create_issue",
      description: "Create a new issue in a repository",
      inputSchema: {
        type: "object",
        properties: {
          owner: {
            type: "string",
            description: "Repository owner",
          },
          repo: {
            type: "string",
            description: "Repository name",
          },
          title: {
            type: "string",
            description: "Issue title",
          },
          body: {
            type: "string",
            description: "Issue body",
          },
          labels: {
            type: "array",
            description: "Issue labels",
          },
        },
        required: ["owner", "repo", "title"],
      },
    },
    {
      name: "list_issues",
      description: "List issues in a repository",
      inputSchema: {
        type: "object",
        properties: {
          owner: {
            type: "string",
            description: "Repository owner",
          },
          repo: {
            type: "string",
            description: "Repository name",
          },
          state: {
            type: "string",
            description: "Issue state",
          },
          labels: {
            type: "string",
            description: "Filter by labels",
          },
        },
        required: ["owner", "repo"],
      },
    },
    {
      name: "create_pull_request",
      description: "Create a new pull request",
      inputSchema: {
        type: "object",
        properties: {
          owner: {
            type: "string",
            description: "Repository owner",
          },
          repo: {
            type: "string",
            description: "Repository name",
          },
          title: {
            type: "string",
            description: "Pull request title",
          },
          head: {
            type: "string",
            description: "Head branch",
          },
          base: {
            type: "string",
            description: "Base branch",
          },
          body: {
            type: "string",
            description: "Pull request body",
          },
        },
        required: ["owner", "repo", "title", "head", "base"],
      },
    },
  ],
  transport: {
    type: "stdio",
    command: "npx",
    args: ["@modelcontextprotocol/server-github"],
    env: {
      GITHUB_TOKEN: "your_github_token_here",
    },
  },
  parameters: [
    {
      name: "GITHUB_TOKEN",
      description: "GitHub personal access token",
      required: true,
      type: "string",
    },
    {
      name: "GITHUB_API_URL",
      description: "GitHub API URL (for GitHub Enterprise)",
      required: false,
      type: "string",
    },
  ],
};

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

export const Default: Story = {
  args: {
    entry: mockEntry,
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

export const Installing: Story = {
  args: {
    ...Default.args,
    isInstalling: true,
  },
};

export const NoProxiesAvailable: Story = {
  args: {
    entry: mockEntry,
    proxiesWithMcp: mockProxiesWithMcp,
    proxiesWithoutMcp: [],
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
      await console.log("Installing MCP server:", values);
    },
    isInstalling: false,
    onCloseTool: () => {
      console.log("Closing tool sheet");
    },
  },
};

export const CommunityServer: Story = {
  args: {
    entry: {
      ...mockEntry,
      isOfficial: false,
      title: "Custom GitHub Tools",
      description:
        "A community-built MCP server with additional GitHub functionality.",
      homepage: "https://github.com/community/github-mcp-tools",
    },
    proxiesWithMcp: [],
    proxiesWithoutMcp: mockProxiesWithoutMcp,
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
      await console.log("Installing community MCP server:", values);
    },
    isInstalling: false,
    onCloseTool: () => {
      console.log("Closing tool sheet");
    },
  },
};

export const NoReadme: Story = {
  args: {
    entry: {
      ...mockEntry,
      readme: null,
    },
    proxiesWithMcp: mockProxiesWithMcp,
    proxiesWithoutMcp: mockProxiesWithoutMcp,
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
      await console.log("Installing MCP server:", values);
    },
    isInstalling: false,
    onCloseTool: () => {
      console.log("Closing tool sheet");
    },
  },
};

export const NoTools: Story = {
  args: {
    entry: {
      ...mockEntry,
      tools: [],
    },
    proxiesWithMcp: mockProxiesWithMcp,
    proxiesWithoutMcp: mockProxiesWithoutMcp,
    serverId: "production-proxy",
    toolLinks: [],
    onInstall: async (values) => {
      await console.log("Installing MCP server:", values);
    },
    isInstalling: false,
    onCloseTool: () => {
      console.log("Closing tool sheet");
    },
  },
};
