import { HTTPClient } from "@director.run/mcp/client/http-client";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { protectedProcedure, t } from "@director.run/utilities/trpc";
import { z } from "zod";
import {
  type ServerConfigEntry,
  ServerConfigEntrySchema,
} from "../../config/config-schema";
import type { PlaybookTarget } from "../../playbooks/playbook";
import type { AuthenticatedGatewayContext } from "./index";

const PlaybookCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  servers: z.array(ServerConfigEntrySchema).optional(),
  addToolPrefix: z.boolean().optional(),
});

const PlaybookUpdateSchema = PlaybookCreateSchema.omit({
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

export function createPlaybookStoreRouter() {
  return t.router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
      return await Promise.all(
        await playbookStore
          .getAll(userId)
          .map((playbook) => playbook.toPlainObject()),
      );
    }),

    get: protectedProcedure
      .input(
        z.object({
          playbookId: z.string(),
          queryParams: z.object({}).optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
        const playbook = await playbookStore.get(input.playbookId, userId);
        return await playbook.toPlainObject();
      }),

    create: protectedProcedure
      .input(PlaybookCreateSchema)
      .mutation(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
        return (
          await playbookStore.create({
            name: input.name,
            description: input.description ?? undefined,
            servers: input.servers?.map(oldServerToTargetParams),
            userId,
          })
        ).toPlainObject();
      }),
    update: protectedProcedure
      .input(
        z.object({
          playbookId: z.string(),
          attributes: PlaybookUpdateSchema,
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
        const playbook = await playbookStore.get(input.playbookId, userId);
        const updated = await playbook.update({
          name: input.attributes.name,
          description: input.attributes.description ?? undefined,
        });
        return await updated.toPlainObject();
      }),
    delete: protectedProcedure
      .input(z.object({ playbookId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
        await playbookStore.delete(input.playbookId, userId);
        return { success: true };
      }),
    addServer: protectedProcedure
      .input(
        z.object({
          playbookId: z.string(),
          server: ServerConfigEntrySchema,
          queryParams: z
            .object({
              includeTools: z.boolean().optional(),
            })
            .optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
        const playbook = await playbookStore.get(input.playbookId, userId);

        const target = await playbook.addTarget({
          ...oldServerToTargetParams(input.server),
          prompts: {
            include: [], // Disable prompts by default
          },
        });

        return await target.toPlainObject({
          tools: input.queryParams?.includeTools,
          connectionInfo: true,
        });
      }),

    updateServer: protectedProcedure
      .input(
        z.object({
          playbookId: z.string(),
          serverName: z.string(),
          attributes: TargetUpdateSchema,
          queryParams: z
            .object({
              includeTools: z.boolean().optional(),
            })
            .optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
        const playbook = await playbookStore.get(input.playbookId, userId);
        const server = await playbook.updateTarget(
          input.serverName,
          input.attributes,
        );
        return await server.toPlainObject({
          tools: input.queryParams?.includeTools,
          connectionInfo: true,
        });
      }),

    getServer: protectedProcedure
      .input(
        z.object({
          playbookId: z.string(),
          serverName: z.string(),
          queryParams: z
            .object({
              includeTools: z.boolean().optional(),
            })
            .optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
        const playbook = await playbookStore.get(input.playbookId, userId);
        const target = await playbook.getTarget(input.serverName);

        return await target.toPlainObject({
          tools: input.queryParams?.includeTools,
          connectionInfo: true,
        });
      }),

    authenticate: protectedProcedure
      .input(z.object({ playbookId: z.string(), serverName: z.string() }))
      .query(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
        const playbook = await playbookStore.get(input.playbookId, userId);
        const target = await playbook.getTarget(input.serverName);

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

    logout: protectedProcedure
      .input(z.object({ playbookId: z.string(), serverName: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
        const playbook = await playbookStore.get(input.playbookId, userId);
        const target = await playbook.getTarget(input.serverName);
        if (target instanceof HTTPClient) {
          await target.logout();
        } else {
          throw new AppError(
            ErrorCode.BAD_REQUEST,
            "can only logout http clients",
          );
        }
      }),

    purge: protectedProcedure.mutation(({ ctx }) => {
      const { playbookStore } = ctx as AuthenticatedGatewayContext;
      return playbookStore.purge();
    }),

    removeServer: protectedProcedure
      .input(
        z.object({
          playbookId: z.string(),
          serverName: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
        const playbook = await playbookStore.get(input.playbookId, userId);
        const server = await playbook.removeTarget(input.serverName);
        return await server.toPlainObject({
          connectionInfo: true,
        });
      }),

    addPrompt: protectedProcedure
      .input(
        z.object({
          playbookId: z.string(),
          prompt: PromptSchema,
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
        const playbook = await playbookStore.get(input.playbookId, userId);
        const prompt = await playbook.addPrompt(input.prompt);
        return prompt;
      }),

    removePrompt: protectedProcedure
      .input(
        z.object({
          playbookId: z.string(),
          promptName: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
        const playbook = await playbookStore.get(input.playbookId, userId);
        const result = await playbook.removePrompt(input.promptName);
        return result;
      }),

    updatePrompt: protectedProcedure
      .input(
        z.object({
          playbookId: z.string(),
          promptName: z.string(),
          prompt: PromptSchema.partial(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
        const playbook = await playbookStore.get(input.playbookId, userId);
        const prompt = await playbook.updatePrompt(
          input.promptName,
          input.prompt,
        );
        return prompt;
      }),

    listPrompts: protectedProcedure
      .input(
        z.object({
          playbookId: z.string(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
        const playbook = await playbookStore.get(input.playbookId, userId);
        return await playbook.listPrompts();
      }),
  });
}

const oldServerToTargetParams = (server: ServerConfigEntry): PlaybookTarget => {
  if (server.transport.type === "http") {
    return {
      type: server.transport.type,
      name: server.name,
      url: server.transport.url,
      headers: server.transport.headers,
      tools: server.tools,
      disabled: server.disabled,
    };
  } else if (server.transport.type === "stdio") {
    return {
      type: server.transport.type,
      name: server.name,
      command: server.transport.command,
      args: server.transport.args,
      env: server.transport.env,
      tools: server.tools,
      disabled: server.disabled,
    };
  } else {
    throw new AppError(ErrorCode.BAD_REQUEST, "invalid server transport type");
  }
};
