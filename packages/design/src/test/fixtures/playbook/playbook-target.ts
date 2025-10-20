import type { PlaybookTarget } from "../../../components/types";

export const mockPlaybookTarget: PlaybookTarget = {
  name: "context-7",
  connectionInfo: {
    status: "connected",
    lastConnectedAt: new Date("2025-09-16T15:12:14.154Z"),
  },
  type: "stdio",
  command: "npx",
  args: ["-y", "@upstash/context7-mcp"],
  env: {},
  disabled: false,
};
