import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourceTemplatesRequestSchema,
  ListResourceTemplatesResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { ResourceTemplate } from "@modelcontextprotocol/sdk/types.js";
import type { ConnectedClient } from "../connected-client";

export function setupResourceTemplateHandlers(
  server: Server,
  connectedClients: ConnectedClient[],
) {
  // List Resource Templates Handler
  server.setRequestHandler(
    ListResourceTemplatesRequestSchema,
    async (request) => {
      const allTemplates: ResourceTemplate[] = [];

      for (const connectedClient of connectedClients) {
        try {
          const result = await connectedClient.request(
            {
              method: "resources/templates/list" as const,
              params: {
                cursor: request.params?.cursor,
                _meta: request.params?._meta || {
                  progressToken: undefined,
                },
              },
            },
            ListResourceTemplatesResultSchema,
          );

          if (result.resourceTemplates) {
            const templatesWithSource = result.resourceTemplates.map(
              (template) => ({
                ...template,
                name: `[${connectedClient.name}] ${template.name || ""}`,
                description: template.description
                  ? `[${connectedClient.name}] ${template.description}`
                  : undefined,
              }),
            );
            allTemplates.push(...templatesWithSource);
          }
        } catch (error) {
          console.error(
            `Error fetching resource templates from ${connectedClient.name}:`,
            error,
          );
        }
      }

      return {
        resourceTemplates: allTemplates,
        nextCursor: request.params?.cursor,
      };
    },
  );
}
