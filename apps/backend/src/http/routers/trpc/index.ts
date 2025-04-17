import {} from "../../../services/installer/claude";
import {} from "../../../services/installer/cursor";
import type { ProxyServerStore } from "../../../services/proxy/ProxyServerStore";
import { createInstallerRouter } from "./installer";
import { t } from "./middleware";
import { createRegistryRouter } from "./registry";
import { createStoreRouter } from "./store";

export function createAppRouter({
  proxyStore,
}: { proxyStore: ProxyServerStore }) {
  return t.router({
    store: createStoreRouter({ proxyStore }),
    installer: createInstallerRouter({ proxyStore }),
    registry: createRegistryRouter(),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
