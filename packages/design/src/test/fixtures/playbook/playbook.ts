import type { PlaybookDetail } from "../../../components/types.ts";

export const mockPlaybook: () => PlaybookDetail = () => ({
  id: "test",
  name: "test",
  description: "A playbook for getting started",
  userId: "test-user-id",
  prompts: [
    {
      name: "Test prompt",
      title: "Test prompt",
      body: "Greet the user with a friendly hello message",
    },
    {
      name: "Identify",
      title: "identify",
      body: "Identif yourelf to the user as batman",
    },
  ],
  servers: [
    {
      type: "stdio",
      name: "hackernews",
      disabled: false,
      command: "uvx",
      args: ["--from", "git+https://github.com/erithwik/mcp-hn", "mcp-hn"],
      env: {},
      connectionInfo: {
        status: "connected",
        lastConnectedAt: new Date("2025-09-30T08:41:06.458Z"),
      },
    },
    {
      type: "http",
      name: "notion",
      disabled: false,
      url: "https://mcp.notion.com/mcp",
      connectionInfo: {
        status: "unauthorized",
        lastErrorMessage: "unauthorized, please re-authenticate",
      },
    },
    {
      type: "stdio",
      name: "fetch",
      disabled: false,
      command: "uvx",
      args: ["mcp-server-fetch"],
      env: {},
      connectionInfo: {
        status: "connected",
        lastConnectedAt: new Date("2025-09-30T08:44:34.562Z"),
      },
    },
  ],
  paths: {
    streamable: "/test/mcp",
    sse: "/test/sse",
  },
});
