import { getLogger } from "@director.run/utilities/logger";
import {
  ErrorCode,
  ListResourceTemplatesRequestSchema,
  ListResourceTemplatesResultSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import type { ResourceTemplate } from "@modelcontextprotocol/sdk/types.js";
import type { ProxyServer } from "../proxy-server";
import type { SimpleClient } from "../simple-client";

const logger = getLogger("proxy/handlers/resourceTemplatesHandler");

export function setupResourceTemplateHandlers(
  server: ProxyServer,
  connectedClients: SimpleClient[],
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
          if (
            error instanceof McpError &&
            error.code === ErrorCode.MethodNotFound
          ) {
            logger.warn(
              {
                clientName: connectedClient.name,
                proxyId: server.id,
              },
              "Target does not support resources/templates/list",
            );
            continue;
          }
          logger.error(
            {
              error,
              clientName: connectedClient.name,
              proxyId: server.id,
            },
            "Error fetching resource templates from client",
          );
          continue;
        }
      }

      return {
        resourceTemplates: allTemplates,
        nextCursor: request.params?.cursor,
      };
    },
  );
}
