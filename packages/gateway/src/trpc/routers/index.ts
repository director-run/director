import { t } from "@director.run/utilities/trpc";
import { ProxyServerStore } from "../../proxy-server-store";
import { createInstallerRouter } from "./installer-router";
import { createProxyStoreRouter } from "./store-router";

export function createAppRouter({
  proxyStore,
}: {
  proxyStore: ProxyServerStore;
}) {
  return t.router({
    store: createProxyStoreRouter({ proxyStore }),
    installer: createInstallerRouter({ proxyStore }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
