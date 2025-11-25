import { HTTPClient } from "@director.run/mcp/client/http-client";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { requiredStringSchema } from "@director.run/utilities/schema";
import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import type { PlaybookTarget } from "../../playbooks/playbook";
import { type AuthenticatedGatewayContext, protectedProcedure } from "./index";

const httpTransportSchema = z.object({
  type: z.literal("http"),
  url: requiredStringSchema.url(),
  headers: z.record(requiredStringSchema, z.string()).optional(),
});

export type HTTPTransport = z.infer<typeof httpTransportSchema>;

const stdioTransportSchema = z.object({
  type: z.literal("stdio"),
  command: requiredStringSchema,
  args: z.array(z.string()).default([]),
  env: z.record(requiredStringSchema, z.string()).optional(),
});

export type STDIOTransport = z.infer<typeof stdioTransportSchema>;

const ToolsConfigSchema = z
  .object({
    include: z.array(requiredStringSchema).optional(),
    exclude: z.array(requiredStringSchema).optional(),
    prefix: z.string().trim().optional(),
  })
  .refine((data) => !(data.include && data.exclude), {
    message: "Cannot use both 'include' and 'exclude' at the same time",
    path: ["include", "exclude"],
  });

const ServerConfigEntrySchema = z.object({
  name: z.string().trim().min(1),
  transport: z.discriminatedUnion("type", [
    httpTransportSchema,
    stdioTransportSchema,
  ]),
  source: z
    .object({
      name: z.literal("registry"),
      entryId: requiredStringSchema,
    })
    .optional(),
  tools: ToolsConfigSchema.optional(),
  disabled: z.boolean().optional(),
});

export type ServerConfigEntry = z.infer<typeof ServerConfigEntrySchema>;

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
      const playbooks = await playbookStore.getAll(userId);
      return await Promise.all(
        playbooks.map((playbook) => playbook.toPlainObject()),
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
        const slugify = (await import("slugify")).default;
        const id = slugify(input.name, { lower: true, strict: true });
        return (
          await playbookStore.create({
            id,
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
