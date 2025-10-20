import { t } from "@director.run/utilities/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import type { ClientStore } from "../../client-store";
import { PlaybookStore } from "../../playbooks/playbook-store";
import { getStatus } from "../../status";
import { createClientRouter } from "./client-router";
import { createProxyStoreRouter } from "./store-router";
import { createToolsRouter } from "./tools-router";

export function createAppRouter({
  playbookStore,
  clientStore,
}: {
  playbookStore: PlaybookStore;
  clientStore: ClientStore;
}) {
  return t.router({
    health: t.procedure.query(({ ctx }) => {
      return getStatus(ctx.cliVersion);
    }),
    store: createProxyStoreRouter({ playbookStore }),
    clients: createClientRouter({ playbookStore, clientStore }),
    tools: createToolsRouter({ playbookStore }),
  });
}

export function createTRPCExpressMiddleware({
  playbookStore,
  clientStore,
}: {
  playbookStore: PlaybookStore;
  clientStore: ClientStore;
}) {
  return trpcExpress.createExpressMiddleware({
    router: createAppRouter({ playbookStore, clientStore }),
    createContext: ({ res }) => {
      const cliVersion = res.getHeader("x-cli-version") ?? null;

      return {
        cliVersion,
      };
    },
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
