import { ProxyServerStore } from "../../proxy-server-store";
import { t } from "../server";

export function createDebugRouter({
  proxyStore,
}: {
  proxyStore: ProxyServerStore;
}) {
  return t.router({
    purge: t.procedure.mutation(async () => {
      await proxyStore.purge();
      return { success: true };
    }),
  });
}
