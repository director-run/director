import type { ProxyServerStore } from "../../proxy-server-store";
import { t } from "../server";
import { createInstallerRouter } from "./installer-router";
import { createProxyStoreRouter } from "./store-router";

export function createAppRouter({
  proxyStore,
}: { proxyStore: ProxyServerStore }) {
  return t.router({
    store: createProxyStoreRouter({ proxyStore }),
    installer: createInstallerRouter({ proxyStore }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
