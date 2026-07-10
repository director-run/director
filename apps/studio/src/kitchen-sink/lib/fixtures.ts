import type { ConnectionInfo } from "@director.run/design/components/playbooks-clients/playbook-section-connect.tsx";
import type { PlaybookDetail } from "@director.run/design/components/types.ts";

/** Shared fake-latency helper for the mock routes' async handlers. */
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Three named playbooks with a deliberate spread of connection statuses
 * (connected / disconnected / unauthorized / error) so every server state in
 * the design system is visible across the mock app.
 */
export function kitchenSinkPlaybooks(): PlaybookDetail[] {
  return [
    {
      id: "incident-response",
      name: "Incident Response",
      description: "On-call tooling for triaging and resolving incidents.",
      userId: "kitchen-sink-user",
      prompts: [
        {
          name: "triage",
          title: "Triage checklist",
          body: "Summarise the incident, list impacted services and propose next steps.",
        },
        {
          name: "postmortem",
          title: "Draft postmortem",
          body: "Write a blameless postmortem from the incident timeline.",
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
            lastConnectedAt: new Date("2026-06-01T09:30:00.000Z"),
          },
        },
        {
          type: "http",
          name: "sentry",
          disabled: false,
          url: "https://mcp.sentry.dev/mcp",
          connectionInfo: {
            status: "error",
            lastErrorMessage: "Connection refused (ECONNREFUSED)",
          },
        },
        {
          type: "stdio",
          name: "filesystem",
          disabled: true,
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
          env: {},
          connectionInfo: {
            status: "disconnected",
          },
        },
      ],
      paths: {
        streamable: "/incident-response/mcp",
      },
    },
    {
      id: "data-pipeline",
      name: "Data Pipeline",
      description: "Servers for building and monitoring ETL workflows.",
      userId: "kitchen-sink-user",
      prompts: [
        {
          name: "explain-schema",
          title: "Explain schema",
          body: "Describe the tables and relationships in the warehouse.",
        },
      ],
      servers: [
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
            lastConnectedAt: new Date("2026-06-01T08:15:00.000Z"),
          },
        },
      ],
      paths: {
        streamable: "/data-pipeline/mcp",
      },
    },
    {
      id: "personal-research",
      name: "Personal Research",
      description: "A grab-bag of servers for everyday research tasks.",
      userId: "kitchen-sink-user",
      prompts: [],
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
            lastConnectedAt: new Date("2026-06-02T14:00:00.000Z"),
          },
        },
        {
          type: "http",
          name: "github",
          disabled: false,
          url: "https://api.githubcopilot.com/mcp/",
          connectionInfo: {
            status: "connected",
            lastConnectedAt: new Date("2026-06-02T14:05:00.000Z"),
            isAuthenticated: true,
          },
        },
      ],
      paths: {
        streamable: "/personal-research/mcp",
      },
    },
  ];
}

/** A single playbook with no servers or prompts, for empty-state variants. */
export function emptyKitchenSinkPlaybook(): PlaybookDetail {
  return {
    id: "empty-playbook",
    name: "Empty Playbook",
    description: "A brand new playbook with nothing added yet.",
    userId: "kitchen-sink-user",
    prompts: [],
    servers: [],
    paths: {
      streamable: "/empty-playbook/mcp",
    },
  };
}

/** Connection details rendered by the "Connect to Playbook" sidebar. */
export function kitchenSinkConnectionInfo(playbookId: string): ConnectionInfo {
  return {
    playbookId,
    apiKey: "dk_live_abc123def456ghi789jkl012",
    streamableUrl: `https://gateway.director.run/mcp/${playbookId}`,
  };
}

/** API-key summary shown on the settings page. */
export const kitchenSinkApiKey = {
  id: "default",
  keyPrefix: "dk_live_",
  createdAt: "2026-05-01T12:00:00.000Z",
  lastUsedAt: "2026-06-02T14:05:00.000Z" as string | null,
};
