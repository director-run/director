import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  GetPromptRequestSchema,
  GetPromptResultSchema,
  ListPromptsRequestSchema,
  ListPromptsResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { z } from "zod";
import type { ProxyClient } from "../proxyMCPServers";

export function setupPromptHandlers(
  server: Server,
  connectedClients: ProxyClient[],
  promptToClientMap: Map<string, ProxyClient>,
) {
  // Get Prompt Handler
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name } = request.params;
    const clientForPrompt = promptToClientMap.get(name);

    if (!clientForPrompt) {
      throw new Error(`Unknown prompt: ${name}`);
    }

    try {
      // Match the exact structure from the example code
      const response = await clientForPrompt.client.request(
        {
          method: "prompts/get" as const,
          params: {
            name,
            arguments: request.params.arguments || {},
            _meta: request.params._meta || {
              progressToken: undefined,
            },
          },
        },
        GetPromptResultSchema,
      );

      return response;
    } catch (error) {
      console.error(
        `Error getting prompt from ${clientForPrompt.name}:`,
        error,
      );
      throw error;
    }
  });

  // List Prompts Handler
  server.setRequestHandler(ListPromptsRequestSchema, async (request) => {
    const allPrompts: z.infer<typeof ListPromptsResultSchema>["prompts"] = [];
    promptToClientMap.clear();

    for (const connectedClient of connectedClients) {
      try {
        const result = await connectedClient.client.request(
          {
            method: "prompts/list" as const,
            params: {
              cursor: request.params?.cursor,
              _meta: request.params?._meta || {
                progressToken: undefined,
              },
            },
          },
          ListPromptsResultSchema,
        );

        if (result.prompts) {
          const promptsWithSource = result.prompts.map((prompt) => {
            promptToClientMap.set(prompt.name, connectedClient);
            return {
              ...prompt,
              description: `[${connectedClient.name}] ${prompt.description || ""}`,
            };
          });
          allPrompts.push(...promptsWithSource);
        }
      } catch (error) {
        console.error(
          `Error fetching prompts from ${connectedClient.name}:`,
          error,
        );
      }
    }

    return {
      prompts: allPrompts,
      nextCursor: request.params?.cursor,
    };
  });
}
