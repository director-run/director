import { publicProcedure, t } from "@director.run/utilities/trpc";
import { TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { auth } from "../../auth";
import type { Database } from "../../db/database";
import type { UserStatus } from "../../db/schema";
import { env } from "../../env";
import { PlaybookStore } from "../../playbooks/playbook-store";
import { getStatus } from "../../status";
import { createAuthRouter } from "./auth-router";
import { createSettingsRouter } from "./settings-router";
import { createPlaybookStoreRouter } from "./store-router";
import { createToolsRouter } from "./tools-router";

export type GatewayContext = {
  cliVersion: string | null;
  playbookStore: PlaybookStore;
  database: Database;
  userId: string | undefined;
  userStatus: UserStatus | undefined;
};

export type AuthenticatedGatewayContext = GatewayContext & {
  userId: string;
  userStatus: UserStatus;
};

// Middleware that enforces user is authenticated (and active if waitlist is enabled)
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  const context = ctx as GatewayContext;
  if (!context.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (env.WAITLIST_ENABLED && context.userStatus === "PENDING") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "USER_PENDING",
    });
  }
  return next({
    ctx: {
      ...ctx,
      userId: context.userId,
      userStatus: context.userStatus,
    },
  });
});

export const protectedProcedure = publicProcedure.use(enforceUserIsAuthed);

export function createAppRouter() {
  return t.router({
    health: publicProcedure.query(({ ctx }) => {
      return getStatus(ctx.cliVersion);
    }),
    auth: createAuthRouter(),
    store: createPlaybookStoreRouter(),
    tools: createToolsRouter(),
    settings: createSettingsRouter(),
  });
}

export function createTRPCExpressMiddleware({
  playbookStore,
  database,
}: {
  playbookStore: PlaybookStore;
  database: Database;
}): ReturnType<typeof trpcExpress.createExpressMiddleware> {
  return trpcExpress.createExpressMiddleware({
    router: createAppRouter(),
    createContext: async ({ req, res }): Promise<GatewayContext> => {
      const headerValue = res.getHeader("x-cli-version");
      const cliVersion = typeof headerValue === "string" ? headerValue : null;

      let userId: string | undefined = undefined;
      let userStatus: UserStatus | undefined = undefined;

      const session = await auth.api.getSession({
        headers: req.headers as Record<string, string>,
      });

      if (session) {
        userId = session.user.id;
        // Get user status from the session user object
        userStatus = (session.user as { status?: UserStatus }).status;
      }

      return {
        cliVersion,
        playbookStore,
        database,
        userId,
        userStatus,
      };
    },
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
