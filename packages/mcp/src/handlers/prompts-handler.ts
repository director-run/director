import { getLogger } from "@director.run/utilities/logger";
import {
  ErrorCode,
  GetPromptRequestSchema,
  GetPromptResultSchema,
  ListPromptsRequestSchema,
  ListPromptsResultSchema,
  McpError,
  type Prompt,
} from "@modelcontextprotocol/sdk/types.js";
import type { ProxyServer } from "../proxy-server";
import type { SimpleClient } from "../simple-client";

const logger = getLogger("proxy/handlers/promptsHandler");

export function setupPromptHandlers(
  server: ProxyServer,
  connectedClients: SimpleClient[],
) {
  const promptToClientMap = new Map<string, SimpleClient>();
  // Get Prompt Handler
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name } = request.params;
    const clientForPrompt = promptToClientMap.get(name);

    if (!clientForPrompt) {
      throw new Error(`Unknown prompt: ${name}`);
    }

    try {
      // Match the exact structure from the example code
      const response = await clientForPrompt.request(
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
      logger.error(
        {
          error,
          clientName: clientForPrompt.name,
          promptName: name,
          proxyId: server.id,
        },
        "Error getting prompt from client",
      );
      throw error;
    }
  });

  // List Prompts Handler
  server.setRequestHandler(ListPromptsRequestSchema, async (request) => {
    const allPrompts: Prompt[] = [];
    promptToClientMap.clear();

    for (const connectedClient of connectedClients) {
      try {
        const result = await connectedClient.request(
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
        if (
          error instanceof McpError &&
          error.code === ErrorCode.MethodNotFound
        ) {
          logger.warn(
            {
              clientName: connectedClient.name,
              proxyId: server.id,
            },
            "Target does not support prompts/list",
          );
          continue;
        } else {
          logger.warn(
            {
              error,
              clientName: connectedClient.name,
              proxyId: server.id,
            },
            "Could not fetch prompts from client. Continuing with other clients.",
          );
          continue;
        }
      }
    }

    return {
      prompts: allPrompts,
      nextCursor: request.params?.cursor,
    };
  });
}
