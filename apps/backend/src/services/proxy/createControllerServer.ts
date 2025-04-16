import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { VERSION } from "../../config";
import type { ProxyServerStore } from "./ProxyServerStore";

const CreateOrUpdateFileSchema = z.object({
  owner: z.string().describe("Repository owner (username or organization)"),
  repo: z.string().describe("Repository name"),
  path: z.string().describe("Path where to create/update the file"),
  content: z.string().describe("Content of the file"),
  message: z.string().describe("Commit message"),
  branch: z.string().describe("Branch to create/update the file in"),
  sha: z
    .string()
    .optional()
    .describe(
      "SHA of the file being replaced (required when updating existing files)",
    ),
});

const SearchRepositoriesSchema = z.object({
  query: z.string().describe("Search query (see GitHub search syntax)"),
  page: z
    .number()
    .optional()
    .describe("Page number for pagination (default: 1)"),
  perPage: z
    .number()
    .optional()
    .describe("Number of results per page (default: 30, max: 100)"),
});

export function createControllerServer({ store }: { store: ProxyServerStore }) {
  const server = new Server(
    {
      name: "github-mcp-server",
      version: VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "create_or_update_file",
          description: "Create or update a single file in a GitHub repository",
          inputSchema: zodToJsonSchema(CreateOrUpdateFileSchema),
        },
        {
          name: "search_repositories",
          description: "Search for GitHub repositories",
          inputSchema: zodToJsonSchema(SearchRepositoriesSchema),
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      if (!request.params.arguments) {
        throw new Error("Arguments are required");
      }

      switch (request.params.name) {
        case "search_repositories": {
          const args = SearchRepositoriesSchema.parse(request.params.arguments);
          //   const results = await repository.searchRepositories(
          //     args.query,
          //     args.page,
          //     args.perPage,
          //   );
          const result = {
            status: "success",
            message: "Repositories searched successfully",
            data: [
              {
                name: "test",
                description: "test",
                url: "https://github.com/test",
              },
            ],
          };
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        }

        case "create_or_update_file": {
          const args = CreateOrUpdateFileSchema.parse(request.params.arguments);
          //   const result = await files.createOrUpdateFile(
          //     args.owner,
          //     args.repo,
          //     args.path,
          //     args.content,
          //     args.message,
          //     args.branch,
          //     args.sha,
          //   );
          const result = {
            status: "success",
            message: "File created/updated successfully",
          };
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        }

        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
      }
      throw error;
    }
  });

  return server;
}
