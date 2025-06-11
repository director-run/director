import {
  ConfiguratorTarget,
  allClientStatuses,
  getConfigurator,
  getProxyInstalledStatus,
} from "@director.run/client-configurator/index";
import { t } from "@director.run/utilities/trpc";
import { joinURL } from "@director.run/utilities/url";
import { z } from "zod";
import { getSSEPathForProxy } from "../../helpers";
import type { ProxyServerStore } from "../../proxy-server-store";

export function createInstallerRouter({
  proxyStore,
}: { proxyStore: ProxyServerStore }) {
  return t.router({
    allClients: t.procedure.query(() => allClientStatuses()),
    byProxy: t.router({
      list: t.procedure
        .input(z.object({ proxyId: z.string() }))
        .query(async ({ input }) => {
          return await getProxyInstalledStatus(input.proxyId);
        }),
      install: t.procedure
        .input(
          z.object({
            client: z.nativeEnum(ConfiguratorTarget),
            proxyId: z.string(),
            baseUrl: z.string(),
          }),
        )
        .mutation(async ({ input }) => {
          const proxy = proxyStore.get(input.proxyId);
          const installer = await getConfigurator(input.client);
          await installer.install({
            name: proxy.id,
            url: joinURL(input.baseUrl, getSSEPathForProxy(proxy.id)),
          });
        }),
      uninstall: t.procedure
        .input(
          z.object({
            client: z.nativeEnum(ConfiguratorTarget),
            proxyId: z.string(),
          }),
        )
        .mutation(async ({ input }) => {
          const proxy = proxyStore.get(input.proxyId);
          const installer = await getConfigurator(input.client);
          await installer.uninstall(proxy.id);
        }),
    }),
  });
}
