import { HTTPClient } from "@director.run/mcp/client/http-client";
import { createRegistryClient } from "@director.run/registry/client";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { requiredStringSchema } from "@director.run/utilities/schema";
import { t } from "@director.run/utilities/trpc";
import { joinURL } from "@director.run/utilities/url";
import { z } from "zod";
import { auth } from "../../auth";
import { decrypt, encrypt } from "../../crypto";
import { env } from "../../env";
import {
  getSSEPathForPlaybook,
  getStreamablePathForPlaybook,
} from "../../helpers";
import type { PlaybookTarget } from "../../playbooks/playbook";
import { type AuthenticatedGatewayContext, protectedProcedure } from "./index";

const logger = getLogger("store-router");

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

    /**
     * Add a server from the registry by looking up its entry and building
     * the transport with the provided parameters.
     */
    addRegistryServer: protectedProcedure
      .input(
        z.object({
          playbookId: z.string(),
          registryEntryName: z.string().trim().min(1),
          parameters: z.record(z.string(), z.string()).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;

        if (!env.REGISTRY_URL) {
          throw new AppError(
            ErrorCode.BAD_REQUEST,
            "Registry URL is not configured",
          );
        }

        const registryClient = createRegistryClient(env.REGISTRY_URL);

        // Fetch the registry entry
        let entry;
        try {
          entry = await registryClient.entries.getEntryByName.query({
            name: input.registryEntryName,
          });
        } catch (error) {
          logger.error({
            message: "failed to fetch registry entry",
            entryName: input.registryEntryName,
            error,
          });
          throw new AppError(
            ErrorCode.NOT_FOUND,
            `Registry entry "${input.registryEntryName}" not found`,
          );
        }

        // Get the transport with parameters substituted
        let transport;
        try {
          transport = await registryClient.entries.getTransportForEntry.query({
            entryName: input.registryEntryName,
            parameters: input.parameters,
          });
        } catch (error) {
          logger.error({
            message: "failed to build transport for registry entry",
            entryName: input.registryEntryName,
            error,
          });
          throw new AppError(
            ErrorCode.BAD_REQUEST,
            `Failed to build transport for "${input.registryEntryName}": ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }

        const playbook = await playbookStore.get(input.playbookId, userId);

        // Build the target configuration
        let targetConfig: PlaybookTarget;

        if (transport.type === "http") {
          targetConfig = {
            type: "http",
            name: entry.name,
            url: transport.url,
            headers: transport.headers,
            source: {
              name: "registry",
              entryId: entry.id,
            },
          };
        } else {
          targetConfig = {
            type: "stdio",
            name: entry.name,
            command: transport.command,
            args: transport.args,
            env: transport.env,
            source: {
              name: "registry",
              entryId: entry.id,
            },
          };
        }

        const target = await playbook.addTarget({
          ...targetConfig,
          prompts: {
            include: [], // Disable prompts by default
          },
        });

        logger.info({
          message: "added registry server to playbook",
          playbookId: input.playbookId,
          serverName: entry.name,
          registryEntry: input.registryEntryName,
          transportType: transport.type,
        });

        return await target.toPlainObject({
          tools: false,
          connectionInfo: true,
        });
      }),

    /**
     * Add an HTTP server to a playbook.
     */
    addHTTPServer: protectedProcedure
      .input(
        z.object({
          playbookId: z.string(),
          name: z.string().trim().min(1),
          url: requiredStringSchema.url(),
          headers: z.record(requiredStringSchema, z.string()).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
        const playbook = await playbookStore.get(input.playbookId, userId);

        const target = await playbook.addTarget({
          type: "http",
          name: input.name,
          url: input.url,
          headers: input.headers,
          prompts: {
            include: [], // Disable prompts by default
          },
        });

        logger.info({
          message: "added HTTP server to playbook",
          playbookId: input.playbookId,
          serverName: input.name,
          url: input.url,
        });

        return await target.toPlainObject({
          tools: false,
          connectionInfo: true,
        });
      }),

    /**
     * Add a stdio server to a playbook.
     */
    addStdioServer: protectedProcedure
      .input(
        z.object({
          playbookId: z.string(),
          name: z.string().trim().min(1),
          command: requiredStringSchema,
          args: z.array(z.string()).default([]),
          env: z.record(requiredStringSchema, z.string()).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { playbookStore, userId } = ctx as AuthenticatedGatewayContext;
        const playbook = await playbookStore.get(input.playbookId, userId);

        const target = await playbook.addTarget({
          type: "stdio",
          name: input.name,
          command: input.command,
          args: input.args,
          env: input.env,
          prompts: {
            include: [], // Disable prompts by default
          },
        });

        logger.info({
          message: "added stdio server to playbook",
          playbookId: input.playbookId,
          serverName: input.name,
          command: input.command,
        });

        return await target.toPlainObject({
          tools: false,
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

    /**
     * Get connection info for a playbook including URLs with API key.
     * Uses the user's stored encrypted API key (created on registration).
     * For existing users without an encrypted key, creates one on first access.
     */
    getConnectionInfo: protectedProcedure
      .input(
        z.object({
          playbookId: z.string(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { playbookStore, database, userId } =
          ctx as AuthenticatedGatewayContext;

        // Verify playbook exists and belongs to user
        const playbook = await playbookStore.get(input.playbookId, userId);
        const playbookId = playbook.id;

        // Get the user's encrypted API key
        let user = await database.getUser(userId);
        let apiKey: string;

        if (!user?.encryptedApiKey) {
          // For existing users without an encrypted key, create one now
          // First check if they have an existing API key in the database
          const existingKeys = await database.getApiKeysByUserId(userId);
          const defaultKey = existingKeys.find((k) => k.name === "default");

          if (defaultKey) {
            // User has a key but we don't have it encrypted - need to regenerate
            // Delete the old key and create a new one
            await database.deleteApiKey(defaultKey.id);
          }

          // Create a new API key
          const result = await auth.api.createApiKey({
            body: {
              name: "default",
              userId,
            },
          });

          if (!result.key) {
            throw new AppError(
              ErrorCode.BAD_REQUEST,
              "Failed to create API key",
            );
          }

          // Store the encrypted key
          const encryptedKey = encrypt(result.key, env.BETTER_AUTH_SECRET);
          await database.updateUserEncryptedApiKey(userId, encryptedKey);

          apiKey = result.key;
        } else {
          // Decrypt the existing API key
          apiKey = decrypt(user.encryptedApiKey, env.BETTER_AUTH_SECRET);
        }

        // Build URLs without API key (key returned separately for obfuscation)
        const streamablePath = getStreamablePathForPlaybook(playbookId);
        const ssePath = getSSEPathForPlaybook(playbookId);

        const streamableUrl = joinURL(env.BASE_URL, streamablePath);
        const sseUrl = joinURL(env.BASE_URL, ssePath);

        return {
          playbookId,
          apiKey,
          streamableUrl,
          sseUrl,
        };
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
