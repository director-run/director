import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
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

export const createTRPCContext = async (_opts: { headers: Headers }) => {
  return {};
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

const createTRPCRouter = t.router;

const storeRouter = createTRPCRouter({
  getAll: t.procedure.query(() => {
    try {
      return db.listProxies();
    } catch (error) {
      console.error(error);
      return [];
    }
  }),
  get: t.procedure
    .input(z.object({ proxyId: z.string() }))
    .query(({ input }) => {
      return db.getProxy(input.proxyId);
    }),
  create: t.procedure
    .input(proxySchema.omit({ id: true }))
    .mutation(({ input }) => {
      return db.addProxy(input);
    }),
  update: t.procedure
    .input(
      z.object({
        proxyId: z.string(),
        attributes: proxySchema.partial(),
      }),
    )
    .mutation(({ input }) => {
      return db.updateProxy(input.proxyId, input.attributes);
    }),
  delete: t.procedure
    .input(z.object({ proxyId: z.string() }))
    .mutation(({ input }) => {
      return db.deleteProxy(input.proxyId);
    }),
});

const installerRouter = createTRPCRouter({
  install: t.procedure
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
  uninstall: t.procedure
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
