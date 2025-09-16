import { McpServerDetail } from "@director.run/studio/components/pages/workspace-target-detail.tsx";
import type { StoreServerTransport } from "@director.run/studio/components/types.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

const meta = {
  title: "pages/workspaces/target-detail",
  component: McpServerDetail,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof McpServerDetail>;

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

const mockEntryData = {
  icon: "https://github.com/github.png",
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

## Environment Variables

- \`GITHUB_TOKEN\`: Your GitHub personal access token (required)
- \`GITHUB_API_URL\`: GitHub API URL for GitHub Enterprise (optional)

## Error Handling

The server handles various error conditions gracefully:
- Invalid tokens return appropriate error messages
- Rate limiting is handled with exponential backoff
- Network errors are retried with appropriate delays
`,
};

const mockDescription =
  "A comprehensive GitHub integration that provides tools to interact with repositories, issues, pull requests, and more through the Model Context Protocol.";

// Different transport types for variety
const mockHttpTransport: StoreServerTransport = {
  type: "http",
  url: "https://api.github.com/mcp",
};

const mockMemTransport: StoreServerTransport = {
  type: "mem",
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
    entryData: mockEntryData,
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
      ...mockEntryData,
      icon: undefined,
      readme: undefined,
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
