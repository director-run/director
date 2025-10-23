import { getLogger } from "@director.run/utilities/logger";
import {
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  type Prompt,
} from "@modelcontextprotocol/sdk/types.js";
import type { ProxyServer, ProxyTarget } from "../proxy-server";

const logger = getLogger("proxy/handlers/promptsHandler");

export function setupPromptHandlers(server: ProxyServer) {
  const promptToTarget = new Map<string, ProxyTarget>();

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name } = request.params;
    const clientForPrompt = promptToTarget.get(name);

    if (!clientForPrompt) {
      throw new Error(`Unknown prompt: ${name}`);
    }

    return await clientForPrompt.getPrompt(request.params);
  });

  server.setRequestHandler(ListPromptsRequestSchema, async (request) => {
    const allPrompts: Prompt[] = [];
    promptToTarget.clear();

    for (const connectedClient of server.targets) {
      try {
        const result = await connectedClient.listPrompts(request.params);

        if (result.prompts) {
          const promptsWithSource = result.prompts.map((prompt) => {
            promptToTarget.set(prompt.name, connectedClient);
            return {
              ...prompt,
              description: prompt.description || "",
            };
          });
          allPrompts.push(...promptsWithSource);
        }
      } catch (error) {
        logger.warn(
          {
            error,
            clientName: connectedClient.name,
          },
          "Could not fetch prompts from client. Continuing with other clients.",
        );
        continue;
      }
    }

    return {
      prompts: allPrompts,
      nextCursor: request.params?.cursor,
    };
  });
}
