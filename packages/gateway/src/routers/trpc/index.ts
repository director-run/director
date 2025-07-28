import { t } from "@director.run/utilities/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import { ProxyServerStore } from "../../proxy-server-store";
import { getStatus } from "../../status";
import { createInstallerRouter } from "./installer-router";
import { createRegistryRouter } from "./registry-router";
import { createProxyStoreRouter } from "./store-router";

export function createAppRouter({
  proxyStore,
  registryURL,
}: {
  proxyStore: ProxyServerStore;
  registryURL: string;
}) {
  return t.router({
    health: t.procedure.query(({ ctx }) => {
      return getStatus(ctx.cliVersion);
    }),
    store: createProxyStoreRouter({ proxyStore }),
    installer: createInstallerRouter({ proxyStore }),
    registry: createRegistryRouter({ registryURL, proxyStore }),
  });
}

export function createTRPCExpressMiddleware({
  proxyStore,
  registryURL,
}: {
  proxyStore: ProxyServerStore;
  registryURL: string;
}) {
  return trpcExpress.createExpressMiddleware({
    router: createAppRouter({ proxyStore, registryURL }),
    createContext: ({ res }) => {
      const cliVersion = res.getHeader("x-cli-version") ?? null;

      return {
        cliVersion,
      };
    },
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
