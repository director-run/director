import type { WorkspaceTarget } from "../../../components/types";

export const mockWorkspaceTarget: WorkspaceTarget = {
  name: "context-7",
  status: "connected",
  lastConnectedAt: new Date("2025-09-16T15:12:14.154Z"),
  transport: {
    type: "stdio",
    command: "npx",
    args: ["-y", "@upstash/context7-mcp"],
    env: {},
  },
  disabled: false,
};