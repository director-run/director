import type { ClientStore } from "@director.run/client-configurator/client-store";
import { t } from "@director.run/utilities/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import { getStatus } from "../../status";
import { WorkspaceStore } from "../../workspaces/workspace-store";
import { createClientRouter } from "./client-router";
import { createProxyStoreRouter } from "./store-router";
import { createToolsRouter } from "./tools-router";

export function createAppRouter({
  workspaceStore,
  clientStore,
}: {
  workspaceStore: WorkspaceStore;
  clientStore: ClientStore;
}) {
  return t.router({
    health: t.procedure.query(({ ctx }) => {
      return getStatus(ctx.cliVersion);
    }),
    store: createProxyStoreRouter({ workspaceStore }),
    clients: createClientRouter({ workspaceStore, clientStore }),
    tools: createToolsRouter({ workspaceStore }),
  });
}

export function createTRPCExpressMiddleware({
  workspaceStore,
  clientStore,
}: {
  workspaceStore: WorkspaceStore;
  clientStore: ClientStore;
}) {
  return trpcExpress.createExpressMiddleware({
    router: createAppRouter({ workspaceStore, clientStore }),
    createContext: ({ res }) => {
      const cliVersion = res.getHeader("x-cli-version") ?? null;

      return {
        cliVersion,
      };
    },
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
