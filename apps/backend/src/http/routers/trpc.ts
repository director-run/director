import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { getLogger } from "../../helpers/logger";
import { db } from "../../services/db";
import { proxySchema } from "../../services/db/schema";
import {
  installToClaude,
  uninstallFromClaude,
} from "../../services/installer/claude";
import {
  installToCursor,
  uninstallFromCursor,
} from "../../services/installer/cursor";

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

const storeRouter = createTRPCRouter({
  getAll: loggedProcedure.query(() => {
    try {
      return db.getAll();
    } catch (error) {
      console.error(error);
      return [];
    }
  }),
  get: loggedProcedure
    .input(z.object({ proxyId: z.string() }))
    .query(({ input }) => {
      return db.getProxy(input.proxyId);
    }),
  create: loggedProcedure
    .input(proxySchema.omit({ id: true }))
    .mutation(({ input }) => {
      return db.addProxy(input);
    }),
  update: loggedProcedure
    .input(
      z.object({
        proxyId: z.string(),
        attributes: proxySchema.partial(),
      }),
    )
    .mutation(({ input }) => {
      return db.updateProxy(input.proxyId, input.attributes);
    }),
  delete: loggedProcedure
    .input(z.object({ proxyId: z.string() }))
    .mutation(({ input }) => {
      return db.deleteProxy(input.proxyId);
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
        let configPath: string;
        if (input.client === "claude") {
          await installToClaude({ proxyId: input.proxyId });
          configPath =
            "Library/Application Support/Claude/claude_desktop_config.json";
        } else {
          await installToCursor({ proxyId: input.proxyId });
          configPath = ".cursor/mcp.json";
        }
        return {
          status: "ok" as const,
          configPath: configPath,
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
        let configPath: string;
        if (input.client === "claude") {
          await uninstallFromClaude({ proxyId: input.proxyId });
          configPath =
            "Library/Application Support/Claude/claude_desktop_config.json";
        } else {
          await uninstallFromCursor({ proxyId: input.proxyId });
          configPath = ".cursor/mcp.json";
        }
        return {
          status: "ok" as const,
          configPath: configPath,
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

export const appRouter = createTRPCRouter({
  store: storeRouter,
  installer: installerRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
