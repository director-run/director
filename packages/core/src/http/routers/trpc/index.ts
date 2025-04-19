import type { ProxyServerStore } from "../../../services/proxy/proxy-server-store";
import { createInstallerRouter } from "./installer";
import { t } from "./middleware";
import { createRegistryRouter } from "./registry";
import { createProxyStoreRouter } from "./store";

export function createAppRouter({
  proxyStore,
}: { proxyStore: ProxyServerStore }) {
  return t.router({
    store: createProxyStoreRouter({ proxyStore }),
    installer: createInstallerRouter({ proxyStore }),
    registry: createRegistryRouter(),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
