import { publicProcedure, t } from "@director.run/utilities/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import type { ClientStore } from "../../client-store";
import { PlaybookStore } from "../../playbooks/playbook-store";
import { getStatus } from "../../status";
import { createClientRouter } from "./client-router";
import { createPlaybookStoreRouter } from "./store-router";
import { createToolsRouter } from "./tools-router";

export type GatewayContext = {
  cliVersion: string | null;
  playbookStore: PlaybookStore;
  clientStore: ClientStore;
  userId: string | undefined;
};

export type AuthenticatedGatewayContext = GatewayContext & {
  userId: string;
};

export function createAppRouter() {
  return t.router({
    health: publicProcedure.query(({ ctx }) => {
      return getStatus(ctx.cliVersion);
    }),
    store: createPlaybookStoreRouter(),
    clients: createClientRouter(),
    tools: createToolsRouter(),
  });
}

export function createTRPCExpressMiddleware({
  playbookStore,
  clientStore,
}: {
  playbookStore: PlaybookStore;
  clientStore: ClientStore;
}): ReturnType<typeof trpcExpress.createExpressMiddleware> {
  return trpcExpress.createExpressMiddleware({
    router: createAppRouter(),
    createContext: ({ res }): GatewayContext => {
      const headerValue = res.getHeader("x-cli-version");
      const cliVersion = typeof headerValue === "string" ? headerValue : null;

      // TODO: Replace with actual authentication logic
      const userId = "dummy-user-id";

      return {
        cliVersion,
        playbookStore,
        clientStore,
        userId,
      };
    },
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
