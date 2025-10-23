import { HTTPClient } from "@director.run/mcp/client/http-client";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import {
  type ServerConfigEntry,
  ServerConfigEntrySchema,
} from "../../config/config-schema";
import type { PlaybookTarget } from "../../playbooks/playbook";
import { PlaybookStore } from "../../playbooks/playbook-store";

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

export function createPlaybookStoreRouter({
  playbookStore,
}: { playbookStore: PlaybookStore }) {
  return t.router({
    getAll: t.procedure.query(async () => {
      return await Promise.all(
        await playbookStore
          .getAll()
          .map((playbook) => playbook.toPlainObject()),
      );
    }),

    get: t.procedure
      .input(
        z.object({
          playbookId: z.string(),
          queryParams: z.object({}).optional(),
        }),
      )
      .query(async ({ input }) => {
        const playbook = await playbookStore.get(input.playbookId);
        return await playbook.toPlainObject();
      }),

    create: t.procedure
      .input(PlaybookCreateSchema)
      .mutation(async ({ input }) => {
        return (
          await playbookStore.create({
            name: input.name,
            description: input.description ?? undefined,
            servers: input.servers?.map(oldServerToTargetParams),
          })
        ).toPlainObject();
      }),
    update: t.procedure
      .input(
        z.object({
          playbookId: z.string(),
          attributes: PlaybookUpdateSchema,
        }),
      )
      .mutation(async ({ input }) => {
        const playbook = await playbookStore.get(input.playbookId);
        const updated = await playbook.update({
          name: input.attributes.name,
          description: input.attributes.description ?? undefined,
        });
        return await updated.toPlainObject();
      }),
    delete: t.procedure
      .input(z.object({ playbookId: z.string() }))
      .mutation(async ({ input }) => {
        await playbookStore.delete(input.playbookId);
        return { success: true };
      }),
    addServer: t.procedure
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
      .mutation(async ({ input }) => {
        const playbook = await playbookStore.get(input.playbookId);

        const target = await playbook.addTarget(
          oldServerToTargetParams(input.server),
        );

        return await target.toPlainObject({
          tools: input.queryParams?.includeTools,
          connectionInfo: true,
        });
      }),

    updateServer: t.procedure
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
      .mutation(async ({ input }) => {
        const playbook = await playbookStore.get(input.playbookId);
        const server = await playbook.updateTarget(
          input.serverName,
          input.attributes,
        );
        return await server.toPlainObject({
          tools: input.queryParams?.includeTools,
          connectionInfo: true,
        });
      }),

    getServer: t.procedure
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
      .query(async ({ input }) => {
        const playbook = await playbookStore.get(input.playbookId);
        const target = await playbook.getTarget(input.serverName);

        return await target.toPlainObject({
          tools: input.queryParams?.includeTools,
          connectionInfo: true,
        });
      }),

    authenticate: t.procedure
      .input(z.object({ playbookId: z.string(), serverName: z.string() }))
      .query(async ({ input }) => {
        const playbook = await playbookStore.get(input.playbookId);
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

    logout: t.procedure
      .input(z.object({ playbookId: z.string(), serverName: z.string() }))
      .mutation(async ({ input }) => {
        const playbook = await playbookStore.get(input.playbookId);
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

    purge: t.procedure.mutation(() => playbookStore.purge()),

    removeServer: t.procedure
      .input(
        z.object({
          playbookId: z.string(),
          serverName: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const playbook = await playbookStore.get(input.playbookId);
        const server = await playbook.removeTarget(input.serverName);
        return await server.toPlainObject({
          connectionInfo: true,
        });
      }),

    addPrompt: t.procedure
      .input(
        z.object({
          playbookId: z.string(),
          prompt: PromptSchema,
        }),
      )
      .mutation(async ({ input }) => {
        const playbook = await playbookStore.get(input.playbookId);
        const prompt = await playbook.addPrompt(input.prompt);
        return prompt;
      }),

    removePrompt: t.procedure
      .input(
        z.object({
          playbookId: z.string(),
          promptName: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const playbook = await playbookStore.get(input.playbookId);
        const result = await playbook.removePrompt(input.promptName);
        return result;
      }),

    updatePrompt: t.procedure
      .input(
        z.object({
          playbookId: z.string(),
          promptName: z.string(),
          prompt: PromptSchema.partial(),
        }),
      )
      .mutation(async ({ input }) => {
        const playbook = await playbookStore.get(input.playbookId);
        const prompt = await playbook.updatePrompt(
          input.promptName,
          input.prompt,
        );
        return prompt;
      }),

    listPrompts: t.procedure
      .input(
        z.object({
          playbookId: z.string(),
        }),
      )
      .query(async ({ input }) => {
        const playbook = await playbookStore.get(input.playbookId);
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
