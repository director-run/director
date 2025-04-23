import type { ProxyServerStore } from "../../services/proxy/proxy-server-store";
import { t } from "../server";
import { createInstallerRouter } from "./installer-router";
import { createRegistryRouter } from "./registry-router";
import { createProxyStoreRouter } from "./store-router";

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
