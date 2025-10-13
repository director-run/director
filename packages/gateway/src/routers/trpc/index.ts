import { t } from "@director.run/utilities/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import { getStatus } from "../../status";
import { WorkspaceStore } from "../../workspaces/workspace-store";
import { createInstallerRouter } from "./installer-router";
import { createProxyStoreRouter } from "./store-router";
import { createToolsRouter } from "./tools-router";

export function createAppRouter({
  workspaceStore,
}: {
  workspaceStore: WorkspaceStore;
}) {
  return t.router({
    health: t.procedure.query(({ ctx }) => {
      return getStatus(ctx.cliVersion);
    }),
    store: createProxyStoreRouter({ workspaceStore }),
    installer: createInstallerRouter({ workspaceStore }),
    tools: createToolsRouter({ workspaceStore }),
  });
}

export function createTRPCExpressMiddleware({
  workspaceStore,
}: {
  workspaceStore: WorkspaceStore;
}) {
  return trpcExpress.createExpressMiddleware({
    router: createAppRouter({ workspaceStore }),
    createContext: ({ res }) => {
      const cliVersion = res.getHeader("x-cli-version") ?? null;

      return {
        cliVersion,
      };
    },
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
