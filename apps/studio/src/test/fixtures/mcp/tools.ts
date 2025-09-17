import type { MasterMCPTool } from "@director.run/studio/components/types.ts";

export const mockTools: MasterMCPTool[] = [
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
];
