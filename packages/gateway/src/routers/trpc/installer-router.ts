import { ClaudeInstaller } from "@director.run/client-configurator/claude";
import { CursorInstaller } from "@director.run/client-configurator/cursor";
import {
  ConfiguratorTarget,
  allClientStatuses,
  getConfigurator,
} from "@director.run/client-configurator/index";
import { VSCodeInstaller } from "@director.run/client-configurator/vscode";
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
          const [claudeInstaller, cursorInstaller, vscodeInstaller] =
            await Promise.all([
              ClaudeInstaller.create(),
              CursorInstaller.create(),
              VSCodeInstaller.create(),
            ]);

          const [claudeClients, cursorClients, vscodeClients] =
            await Promise.all([
              claudeInstaller.list(),
              cursorInstaller.list(),
              vscodeInstaller.list(),
            ]);

          const installedOnClaude = claudeClients.filter(
            (install) => install.name === `director__${input.proxyId}`,
          );
          const installedOnCursor = cursorClients.filter(
            (install) => install.name === `director__${input.proxyId}`,
          );
          const installedOnVSCode = vscodeClients.filter(
            (install) => install.name === `director__${input.proxyId}`,
          );

          return {
            claude: installedOnClaude.length > 0,
            cursor: installedOnCursor.length > 0,
            vscode: installedOnVSCode.length > 0,
          };
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
