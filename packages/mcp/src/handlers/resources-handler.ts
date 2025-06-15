import { getLogger } from "@director.run/utilities/logger";
import {
  ListResourcesRequestSchema,
  ListResourcesResultSchema,
  ReadResourceRequestSchema,
  ReadResourceResultSchema,
  type Resource,
} from "@modelcontextprotocol/sdk/types.js";
import type { ProxyServer } from "../proxy-server";
import type { SimpleClient } from "../simple-client";

const logger = getLogger("proxy/handlers/resourcesHandler");

export function setupResourceHandlers(
  server: ProxyServer,
  connectedClients: SimpleClient[],
) {
  const resourceToClientMap = new Map<string, SimpleClient>();

  // List Resources Handler
  server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
    const allResources: Resource[] = [];
    resourceToClientMap.clear();

    for (const connectedClient of connectedClients) {
      try {
        const result = await connectedClient.request(
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
        logger.warn(
          {
            error,
            clientName: connectedClient.name,
            proxyId: server.id,
          },
          "Could not fetch resources from client. Continuing with other clients.",
        );
        continue;
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
      return await clientForResource.request(
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
      logger.error(
        {
          error,
          clientName: clientForResource.name,
          uri,
          proxyId: server.id,
        },
        "Error reading resource from client",
      );
      throw error;
    }
  });
}
