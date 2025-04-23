import { env } from "@director.run/config/env";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { ProxyServer } from "./proxy-server";

// const CreateOrUpdateFileSchema = z.object({
//   owner: z.string().describe("Repository owner (username or organization)"),
//   repo: z.string().describe("Repository name"),
//   path: z.string().describe("Path where to create/update the file"),
//   content: z.string().describe("Content of the file"),
//   message: z.string().describe("Commit message"),
//   branch: z.string().describe("Branch to create/update the file in"),
//   sha: z
//     .string()
//     .optional()
//     .describe(
//       "SHA of the file being replaced (required when updating existing files)",
//     ),
// });

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

export function createControllerServer({ proxy }: { proxy: ProxyServer }) {
  const server = new Server(
    {
      name: `${proxy.id}-controller`,
      version: env.VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, () => {
    return {
      tools: [
        {
          name: "list_targets",
          description: "Search for GitHub repositories",
          inputSchema: zodToJsonSchema(SearchRepositoriesSchema),
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, (request) => {
    try {
      if (!request.params.arguments) {
        throw new Error("Arguments are required");
      }

      switch (request.params.name) {
        case "list_targets": {
          // const args = SearchRepositoriesSchema.parse(request.params.arguments);
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
