import { t } from "@director.run/utilities/trpc";
import { z } from "zod";

import { HTTPClient } from "@director.run/mcp/client/http-client";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import {
  type ServerConfigEntry,
  ServerConfigEntrySchema,
} from "../../config/schema";
import { restartConnectedClients } from "../../helpers";
import {
  serializeProxyServer,
  serializeProxyServerTarget,
  serializeProxyServers,
} from "../../serializers";
import type { WorkspaceTarget } from "../../workspaces/workspace";
import { WorkspaceStore } from "../../workspaces/workspace-store";

const ProxyCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  servers: z.array(ServerConfigEntrySchema).optional(),
  addToolPrefix: z.boolean().optional(),
});

const ProxyUpdateSchema = ProxyCreateSchema.omit({
  servers: true,
}).partial();

const TargetUpdateSchema = ServerConfigEntrySchema.omit({
  transport: true,
}).partial();

const PromptSchema = z.object({
  name: z.string(),
  title: z.string(),
  description: z.string().optional(),
  body: z.string(),
});

export function createProxyStoreRouter({
  proxyStore,
}: { proxyStore: WorkspaceStore }) {
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
        const proxy = await proxyStore.get(input.proxyId);
        const prompts = await proxy.listPrompts();

        return await serializeProxyServer(proxy, {
          ...input.queryParams,
          prompts,
        });
      }),

    create: t.procedure.input(ProxyCreateSchema).mutation(async ({ input }) => {
      return await serializeProxyServer(
        await proxyStore.create({
          name: input.name,
          description: input.description ?? undefined,
          servers: input.servers?.map(oldServerToTargetParams),
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
        const workspace = await proxyStore.get(input.proxyId);
        const updated = await workspace.update({
          name: input.attributes.name,
          description: input.attributes.description ?? undefined,
        });
        return await serializeProxyServer(updated);
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
          server: ServerConfigEntrySchema,
          queryParams: z
            .object({
              includeTools: z.boolean().optional(),
            })
            .optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const proxy = await proxyStore.get(input.proxyId);

        const target = await proxy.addTarget(
          oldServerToTargetParams(input.server),
        );

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
        const server = await proxy.updateTarget(
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
        const server = await proxy.removeTarget(input.serverName);
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
        const prompt = await proxy.addPrompt(input.prompt);
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
        const result = await proxy.removePrompt(input.promptName);
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
        const prompt = await proxy.updatePrompt(input.promptName, input.prompt);
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
        const proxy = await proxyStore.get(input.proxyId);
        return await proxy.listPrompts();
      }),
  });
}

const oldServerToTargetParams = (
  server: ServerConfigEntry,
): WorkspaceTarget => {
  if (server.transport.type === "http") {
    return {
      type: server.transport.type,
      name: server.name,
      url: server.transport.url,
      headers: server.transport.headers,
      toolPrefix: server.toolPrefix,
      disabledTools: server.disabledTools,
      disabled: server.disabled,
    };
  } else if (server.transport.type === "stdio") {
    return {
      type: server.transport.type,
      name: server.name,
      command: server.transport.command,
      args: server.transport.args,
      env: server.transport.env,
      toolPrefix: server.toolPrefix,
      disabledTools: server.disabledTools,
      disabled: server.disabled,
    };
  } else {
    throw new AppError(ErrorCode.BAD_REQUEST, "invalid server transport type");
  }
};
