import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { ErrorCode } from "../../helpers/error";
import { AppError } from "../../helpers/error";
import { getLogger } from "../../helpers/logger";
import { proxySchema } from "../../services/db/schema";
import {
  installToClaude,
  uninstallFromClaude,
} from "../../services/installer/claude";
import {
  installToCursor,
  uninstallFromCursor,
} from "../../services/installer/cursor";
import type { ProxyServerStore } from "../../services/proxy/ProxyServerStore";
import { apps } from "../../services/repository";

const logger = getLogger("http/routers/trpc");

export const createTRPCContext = async (_opts: { headers: Headers }) => {
  return {};
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

// Create logging middleware
const loggingMiddleware = t.middleware(async ({ path, type, next, input }) => {
  const start = Date.now();
  logger.info(
    {
      path,
      type,
      input,
    },
    "trpc request received",
  );

  try {
    const result = await next();
    const duration = Date.now() - start;
    logger.info(
      {
        path,
        type,
        duration,
      },
      "trpc request completed",
    );
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(
      {
        path,
        type,
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "trpc request failed",
    );
    throw error;
  }
});

const createTRPCRouter = t.router;

// Create a procedure with logging middleware
const loggedProcedure = t.procedure.use(loggingMiddleware);

export function createAppRouter({
  proxyStore,
}: { proxyStore: ProxyServerStore }) {
  const storeRouter = createTRPCRouter({
    getAll: loggedProcedure.query(async () => {
      try {
        return (await proxyStore.getAll()).map((proxy) =>
          proxy.toPlainObject(),
        );
      } catch (error) {
        console.error(error);
        return [];
      }
    }),
    get: loggedProcedure
      .input(z.object({ proxyId: z.string() }))
      .query(async ({ input }) => {
        try {
          return proxyStore.get(input.proxyId).toPlainObject();
        } catch (e) {
          if (e instanceof AppError && e.code === ErrorCode.NOT_FOUND) {
            return undefined;
          }
          throw e;
        }
      }),
    create: loggedProcedure
      .input(proxySchema.omit({ id: true }))
      .mutation(async ({ input }) => {
        return (
          await proxyStore.create({
            name: input.name,
            description: input.description ?? undefined,
            servers: input.servers,
          })
        ).toPlainObject();
      }),
    update: loggedProcedure
      .input(
        z.object({
          proxyId: z.string(),
          attributes: proxySchema.partial(),
        }),
      )
      .mutation(async ({ input }) => {
        return (
          await proxyStore.update(input.proxyId, {
            name: input.attributes.name,
            description: input.attributes.description ?? undefined,
            servers: input.attributes.servers,
          })
        ).toPlainObject();
      }),
    delete: loggedProcedure
      .input(z.object({ proxyId: z.string() }))
      .mutation(async ({ input }) => {
        await proxyStore.delete(input.proxyId);
        return { success: true };
      }),
  });

  const installerRouter = createTRPCRouter({
    install: loggedProcedure
      .input(
        z.object({
          proxyId: z.string(),
          client: z.enum(["claude", "cursor"]),
        }),
      )
      .mutation(async ({ input }) => {
        try {
          const proxy = await proxyStore.get(input.proxyId);
          if (input.client === "claude") {
            await installToClaude({ proxyServer: proxy });
          } else {
            await installToCursor({ proxyServer: proxy });
          }
          return {
            status: "ok" as const,
          };
        } catch (error) {
          return {
            status: "fail" as const,
            configPath: "",
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
    uninstall: loggedProcedure
      .input(
        z.object({
          proxyId: z.string(),
          client: z.enum(["claude", "cursor"]),
        }),
      )
      .mutation(async ({ input }) => {
        try {
          const proxy = await proxyStore.get(input.proxyId);
          if (input.client === "claude") {
            await uninstallFromClaude({ proxyServer: proxy });
          } else {
            await uninstallFromCursor({ proxyServer: proxy });
          }
          return {
            status: "ok" as const,
          };
        } catch (error) {
          return {
            status: "fail" as const,
            configPath: "",
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
  });

  const repositoryRouter = createTRPCRouter({
    list: loggedProcedure.query(async () => {
      return apps.map((app) => ({
        name: app.name,
        description: app.description.split("\n")[0],
      }));
    }),
    get: loggedProcedure
      .input(z.object({ name: z.string() }))
      .query(async ({ input }) => {
        const app = apps.find((app) => app.name === input.name);
        if (!app) {
          throw new AppError(
            ErrorCode.NOT_FOUND,
            `Repository item ${input.name} not found`,
          );
        }
        return app;
      }),
  });

  return createTRPCRouter({
    store: storeRouter,
    installer: installerRouter,
    repository: repositoryRouter,
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
