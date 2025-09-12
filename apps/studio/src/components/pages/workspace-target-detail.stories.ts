import type { Meta, StoryObj } from "@storybook/react";
import type { StoreServerTransport } from "../types";
import { McpServerDetail } from "./workspace-target-detail";

const meta = {
  title: "pages/McpServerDetail",
  component: McpServerDetail,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof McpServerDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for MCP server
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

export const WithMemTransport: Story = {
  args: {
    ...Default.args,
    mcp: {
      ...mockMcp,
      transport: mockMemTransport,
    },
  },
};

export const NoIcon: Story = {
  args: {
    ...Default.args,
    entryData: {
      ...mockEntryData,
      icon: undefined,
    },
  },
};

export const NoReadme: Story = {
  args: {
    ...Default.args,
    entryData: {
      ...mockEntryData,
      readme: undefined,
    },
  },
};

export const NoDescription: Story = {
  args: {
    ...Default.args,
    description: null,
  },
};

export const EmptyReadme: Story = {
  args: {
    ...Default.args,
    entryData: {
      ...mockEntryData,
      readme: "",
    },
  },
};

export const LongDescription: Story = {
  args: {
    ...Default.args,
    description:
      "This is a very long description that explains in great detail what this MCP server does, how it works, what features it provides, and how to use it effectively. It should wrap nicely in the UI and provide comprehensive information about the server's capabilities and usage patterns. The description covers all the important aspects that users need to know when working with this particular MCP server implementation.",
  },
};

export const ComplexReadme: Story = {
  args: {
    ...Default.args,
    entryData: {
      ...mockEntryData,
      readme: `# Advanced GitHub MCP Server

A comprehensive Model Context Protocol server for GitHub that provides extensive tools and functionality.

## 🚀 Features

### Repository Management
- **Full CRUD Operations**: Create, read, update, and delete repositories
- **Branch Management**: Create, merge, and delete branches
- **Tag Management**: Create and manage Git tags
- **Webhook Management**: Set up and manage repository webhooks

### Issue & PR Management
- **Advanced Issue Tracking**: Create, update, close, and search issues
- **Pull Request Workflow**: Create, review, merge, and close PRs
- **Code Review Tools**: Comment, approve, and request changes
- **Milestone Management**: Create and manage project milestones

### Code Analysis
- **Code Search**: Search across repositories and codebases
- **Dependency Analysis**: Analyze package dependencies
- **Security Scanning**: Identify security vulnerabilities
- **Code Quality Metrics**: Generate code quality reports

## 📦 Installation

\`\`\`bash
# Install via npm
npm install @modelcontextprotocol/server-github

# Or install via yarn
yarn add @modelcontextprotocol/server-github

# Or install via pnpm
pnpm add @modelcontextprotocol/server-github
\`\`\`

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| \`GITHUB_TOKEN\` | GitHub personal access token | Yes | - |
| \`GITHUB_API_URL\` | GitHub API URL (for Enterprise) | No | \`https://api.github.com\` |
| \`GITHUB_APP_ID\` | GitHub App ID | No | - |
| \`GITHUB_PRIVATE_KEY\` | GitHub App private key | No | - |

### Example Configuration

\`\`\`bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
export GITHUB_API_URL=https://api.github.com
export GITHUB_APP_ID=123456
export GITHUB_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"
\`\`\`

## 🛠️ Usage

### Basic Repository Operations

\`\`\`json
{
  "tool": "get_repository",
  "arguments": {
    "owner": "octocat",
    "repo": "Hello-World"
  }
}
\`\`\`

### Advanced Search

\`\`\`json
{
  "tool": "search_repositories",
  "arguments": {
    "query": "language:typescript stars:>1000 created:>2023-01-01",
    "sort": "stars",
    "order": "desc",
    "per_page": 100
  }
}
\`\`\`

### Issue Management

\`\`\`json
{
  "tool": "create_issue",
  "arguments": {
    "owner": "octocat",
    "repo": "Hello-World",
    "title": "Feature Request: Add dark mode",
    "body": "Please add a dark mode option to the application.",
    "labels": ["enhancement", "ui"],
    "assignees": ["octocat"],
    "milestone": 1
  }
}
\`\`\`

## 🔧 Advanced Features

### Webhook Management
- Create and manage repository webhooks
- Configure webhook events and URLs
- Test webhook deliveries

### Organization Management
- Manage organization repositories
- Handle team permissions
- Configure organization settings

### Security Features
- Dependabot integration
- Security advisory management
- Secret scanning

## 📊 Monitoring & Analytics

The server provides comprehensive monitoring capabilities:
- Request/response logging
- Performance metrics
- Error tracking
- Rate limit monitoring

## 🚨 Error Handling

The server handles various error conditions:
- **Rate Limiting**: Automatic retry with exponential backoff
- **Authentication Errors**: Clear error messages for token issues
- **Network Errors**: Retry logic with appropriate delays
- **API Errors**: Detailed error information from GitHub API

## 🔒 Security Considerations

- Tokens are never logged or exposed
- All API calls use HTTPS
- Rate limiting is respected
- Input validation on all parameters

## 📚 Examples

See the [examples directory](./examples) for more detailed usage examples.

## 🤝 Contributing

Contributions are welcome! Please see our [contributing guide](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Join our Discord server
- Check the documentation wiki
`,
    },
  },
};

export const DifferentProxy: Story = {
  args: {
    ...Default.args,
    proxy: {
      id: "production-proxy",
      name: "Production Proxy",
    },
  },
};

export const LongProxyName: Story = {
  args: {
    ...Default.args,
    proxy: {
      id: "very-long-proxy-name-that-should-wrap",
      name: "Very Long Proxy Name That Should Wrap Nicely in the UI",
    },
  },
};
