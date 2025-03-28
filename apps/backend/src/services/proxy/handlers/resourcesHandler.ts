import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ListResourcesResultSchema,
  ReadResourceRequestSchema,
  ReadResourceResultSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { z } from "zod";
import type { ConnectedClient } from "../createClients";

export function setupResourceHandlers(
  server: Server,
  connectedClients: ConnectedClient[],
  resourceToClientMap: Map<string, ConnectedClient>,
) {
  // List Resources Handler
  server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
    const allResources: z.infer<typeof ListResourcesResultSchema>["resources"] =
      [];
    resourceToClientMap.clear();

    for (const connectedClient of connectedClients) {
      try {
        const result = await connectedClient.client.request(
          {
            method: "resources/list",
            params: {
              cursor: request.params?.cursor,
              _meta: request.params?._meta,
            },
          },
          ListResourcesResultSchema,
        );

        if (result.resources) {
          const resourcesWithSource = result.resources.map((resource) => {
            resourceToClientMap.set(resource.uri, connectedClient);
            return {
              ...resource,
              name: `[${connectedClient.name}] ${resource.name || ""}`,
            };
          });
          allResources.push(...resourcesWithSource);
        }
      } catch (error) {
        console.error(
          `Error fetching resources from ${connectedClient.name}:`,
          error,
        );
      }
    }

    return {
      resources: allResources,
      nextCursor: undefined,
    };
  });

  // Read Resource Handler
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    const clientForResource = resourceToClientMap.get(uri);

    if (!clientForResource) {
      throw new Error(`Unknown resource: ${uri}`);
    }

    try {
      return await clientForResource.client.request(
        {
          method: "resources/read",
          params: {
            uri,
            _meta: request.params._meta,
          },
        },
        ReadResourceResultSchema,
      );
    } catch (error) {
      console.error(
        `Error reading resource from ${clientForResource.name}:`,
        error,
      );
      throw error;
    }
  });
}
