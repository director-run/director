import type { RegistryEntryDetail } from "../../../components/types.ts";
import { mockTools } from "../mcp/tools";
import { mockRegistryEntryReadme } from "./entry-readme";

export const mockRegistryEntry: RegistryEntryDetail = {
  id: "e6029b7b-3175-41fd-89ab-42d11f1d98af",
  name: "github",
  title: "GitHub",
  description:
    "Provides seamless integration with GitHub APIs, enabling advanced automation and interaction capabilities for developers and tools.",
  icon: "/assets/github.svg",
  createdAt: new Date("2025-07-21T15:23:11.986Z"),
  isOfficial: true,
  isEnriched: true,
  isFeatured: false,
  isConnectable: false,
  lastConnectionAttemptedAt: new Date("2025-07-21T15:29:41.955Z"),
  lastConnectionError:
    "[github-client] failed to connect to https://api.githubcopilot.com/mcp/",
  state: "published",
  githubStarCount: 0,
  downloadCount: 0,
  metadata: null,
  transport: {
    url: "https://api.githubcopilot.com/mcp/",
    type: "http",
    headers: { Authorization: "Bearer <github-personal-access-token>" },
  },
  homepage: "https://github.com/github/github-mcp-server",
  source_registry: null,
  categories: [],
  tools: mockTools().map((tool) => ({
    name: tool.name,
    description: tool.description ?? "",
    inputSchema: {
      type: tool.inputSchema.type ?? "object",
      required: tool.inputSchema.required,
      properties: tool.inputSchema.properties as Record<
        string,
        {
          type?: string;
          description?: string;
          title?: string;
          default?: unknown;
          anyOf?: unknown;
        }
      >,
    },
  })),
  parameters: [
    {
      name: "github-personal-access-token",
      type: "string",
      password: true,
      required: true,
      description:
        "Get a personal access token from [GitHub Settings](https://github.com/settings/tokens)",
    },
  ],
  readme: mockRegistryEntryReadme,
};
