import { t } from "@director.run/utilities/trpc";
import { z } from "zod";

import { HTTPClient } from "@director.run/mcp/client/http-client";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { proxyTargetAttributesSchema } from "@director.run/utilities/schema";
import { restartConnectedClients } from "../../helpers";
import { ProxyServerStore } from "../../proxy-server-store";
import {
  serializeProxyServer,
  serializeProxyServerTarget,
  serializeProxyServers,
} from "../../serializers";

const ProxyCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  servers: z.array(proxyTargetAttributesSchema).optional(),
  addToolPrefix: z.boolean().optional(),
});

const ProxyUpdateSchema = ProxyCreateSchema.omit({
  servers: true,
}).partial();

const TargetUpdateSchema = proxyTargetAttributesSchema
  .omit({
    transport: true,
  })
  .partial();

const PromptSchema = z.object({
  name: z.string(),
  title: z.string(),
  description: z.string().optional(),
  body: z.string(),
});

export function createProxyStoreRouter({
  proxyStore,
}: { proxyStore: ProxyServerStore }) {
  return t.router({
    getAll: t.procedure.query(async () => {
      return await serializeProxyServers(await proxyStore.getAll());
    }),

    get: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          queryParams: z
            .object({
              includeInMemoryTargets: z.boolean().optional(),
            })
            .optional(),
        }),
      )
      .query(async ({ input }) => {
        return await serializeProxyServer(
          await proxyStore.get(input.proxyId),
          input.queryParams,
        );
      }),

    create: t.procedure.input(ProxyCreateSchema).mutation(async ({ input }) => {
      return await serializeProxyServer(
        await proxyStore.create({
          name: input.name,
          description: input.description ?? undefined,
          servers: input.servers,
        }),
      );
    }),

    update: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          attributes: ProxyUpdateSchema,
        }),
      )
      .mutation(async ({ input }) => {
        return await serializeProxyServer(
          await proxyStore.update(input.proxyId, {
            name: input.attributes.name,
            description: input.attributes.description ?? undefined,
          }),
        );
      }),
    delete: t.procedure
      .input(z.object({ proxyId: z.string() }))
      .mutation(async ({ input }) => {
        await proxyStore.delete(input.proxyId);
        return { success: true };
      }),
    addServer: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          server: proxyTargetAttributesSchema,
          queryParams: z
            .object({
              includeTools: z.boolean().optional(),
            })
            .optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const target = await proxyStore.addServer(input.proxyId, input.server);
        const proxy = await proxyStore.get(input.proxyId);

        await restartConnectedClients(proxy);
        return await serializeProxyServerTarget(target, input.queryParams);
      }),

    callTool: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          serverName: z.string(),
          toolName: z.string(),
          arguments: z.any(),
        }),
      )
      .mutation(async ({ input }) => {
        const proxy = await proxyStore.get(input.proxyId);
        const target = await proxy.getTarget(input.serverName);
        return await target.originalCallTool({
          name: input.toolName,
          arguments: input.arguments,
        });
      }),

    updateServer: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          serverName: z.string(),
          attributes: TargetUpdateSchema,
          queryParams: z
            .object({
              includeTools: z.boolean().optional(),
            })
            .optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const proxy = await proxyStore.get(input.proxyId);
        const server = await proxyStore.updateServer(
          input.proxyId,
          input.serverName,
          input.attributes,
        );
        await restartConnectedClients(proxy);
        return await serializeProxyServerTarget(server, input.queryParams);
      }),

    getServer: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          serverName: z.string(),
          queryParams: z
            .object({
              includeTools: z.boolean().optional(),
            })
            .optional(),
        }),
      )
      .query(async ({ input }) => {
        const proxy = await proxyStore.get(input.proxyId);
        const target = await proxy.getTarget(input.serverName);

        return await serializeProxyServerTarget(target, input.queryParams);
      }),

    authenticate: t.procedure
      .input(z.object({ proxyId: z.string(), serverName: z.string() }))
      .query(async ({ input }) => {
        const proxy = await proxyStore.get(input.proxyId);
        const target = await proxy.getTarget(input.serverName);

        if (target instanceof HTTPClient) {
          if (target.status === "connected") {
            throw new AppError(
              ErrorCode.BAD_REQUEST,
              "target is already connected",
            );
          } else {
            return await target.startAuthFlow();
          }
        } else {
          throw new AppError(
            ErrorCode.BAD_REQUEST,
            "can only authenticate http clients",
          );
        }
      }),

    purge: t.procedure.mutation(() => proxyStore.purge()),

    removeServer: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          serverName: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const proxy = await proxyStore.get(input.proxyId);
        const server = await proxyStore.removeServer(
          input.proxyId,
          input.serverName,
        );
        await restartConnectedClients(proxy);
        return await serializeProxyServerTarget(server);
      }),

    addPrompt: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          prompt: PromptSchema,
        }),
      )
      .mutation(async ({ input }) => {
        const proxy = await proxyStore.get(input.proxyId);
        const prompt = await proxyStore.addPrompt(input.proxyId, input.prompt);
        await restartConnectedClients(proxy);
        return prompt;
      }),

    removePrompt: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          promptName: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const proxy = await proxyStore.get(input.proxyId);
        const result = await proxyStore.removePrompt(
          input.proxyId,
          input.promptName,
        );
        await restartConnectedClients(proxy);
        return result;
      }),

    updatePrompt: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          promptName: z.string(),
          prompt: PromptSchema.partial(),
        }),
      )
      .mutation(async ({ input }) => {
        const proxy = await proxyStore.get(input.proxyId);
        const prompt = await proxyStore.updatePrompt(
          input.proxyId,
          input.promptName,
          input.prompt,
        );
        await restartConnectedClients(proxy);
        return prompt;
      }),

    listPrompts: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
        }),
      )
      .query(async ({ input }) => {
        return await proxyStore.listPrompts(input.proxyId);
      }),
  });
}
