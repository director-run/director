import { isTest } from "@director.run/utilities/env";
import { ProxyServerStore } from "../../proxy-server-store";
import { t } from "../server";
import { createDebugRouter } from "./debug-router";
import { createInstallerRouter } from "./installer-router";
import { createProxyStoreRouter } from "./store-router";

export function createAppRouter({
  proxyStore,
}: {
  proxyStore: ProxyServerStore;
}) {
  const routers: {
    store: ReturnType<typeof createProxyStoreRouter>;
    installer: ReturnType<typeof createInstallerRouter>;
    debug?: ReturnType<typeof createDebugRouter>;
  } = {
    store: createProxyStoreRouter({ proxyStore }),
    installer: createInstallerRouter({ proxyStore }),
  };

  if (isTest()) {
    routers.debug = createDebugRouter({ proxyStore });
  }

  return t.router(routers);
}

export type AppRouter = ReturnType<typeof createAppRouter>;
