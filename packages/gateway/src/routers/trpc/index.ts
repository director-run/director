import { t } from "@director.run/utilities/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import { ProxyServerStore } from "../../proxy-server-store";
import { createInstallerRouter } from "./installer-router";
import { createProxyStoreRouter } from "./store-router";

export function createAppRouter({
  proxyStore,
  registryURL,
}: {
  proxyStore: ProxyServerStore;
  registryURL: string;
}) {
  return t.router({
    store: createProxyStoreRouter({ proxyStore, registryURL }),
    installer: createInstallerRouter({ proxyStore }),
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
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
