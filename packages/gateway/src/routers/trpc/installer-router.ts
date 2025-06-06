import { ClaudeInstaller } from "@director.run/client-manager/claude";
import { CursorInstaller } from "@director.run/client-manager/cursor";
import { VSCodeInstaller } from "@director.run/client-manager/vscode";
import { getInstaller } from "@director.run/installer/get-installer";
import { t } from "@director.run/utilities/trpc";
import { joinURL } from "@director.run/utilities/url";
import { z } from "zod";
import { getSSEPathForProxy } from "../../helpers";
import type { ProxyServerStore } from "../../proxy-server-store";

export function createInstallerRouter({
  proxyStore,
}: { proxyStore: ProxyServerStore }) {
  return t.router({
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
            client: z.enum(["claude", "cursor", "vscode"]),
            proxyId: z.string(),
            baseUrl: z.string(),
          }),
        )
        .mutation(async ({ input }) => {
          const proxy = proxyStore.get(input.proxyId);
          const installer = await getInstaller(input.client);
          await installer.install({
            name: proxy.id,
            url: joinURL(input.baseUrl, getSSEPathForProxy(proxy.id)),
          });
        }),
      uninstall: t.procedure
        .input(
          z.object({
            client: z.enum(["claude", "cursor", "vscode"]),
            proxyId: z.string(),
          }),
        )
        .mutation(async ({ input }) => {
          const proxy = proxyStore.get(input.proxyId);
          const installer = await getInstaller(input.client);
          await installer.uninstall(proxy.id);
        }),
    }),
    claude: t.router({
      list: t.procedure.query(async () => {
        const installer = await ClaudeInstaller.create();
        return installer.list();
      }),
      restart: t.procedure.mutation(async () => {
        const installer = await ClaudeInstaller.create();
        await installer.restart();
      }),
      purge: t.procedure.mutation(async () => {
        const installer = await ClaudeInstaller.create();
        await installer.purge();
      }),
      config: t.procedure.query(async () => {
        const installer = await ClaudeInstaller.create();
        return installer.openConfig();
      }),
    }),
    cursor: t.router({
      restart: t.procedure.mutation(async () => {
        const installer = await CursorInstaller.create();
        await installer.restart();
      }),
      list: t.procedure.query(async () => {
        const installer = await CursorInstaller.create();
        return installer.list();
      }),
      purge: t.procedure.mutation(async () => {
        const installer = await CursorInstaller.create();
        await installer.purge();
      }),
      config: t.procedure.query(async () => {
        const installer = await CursorInstaller.create();
        return installer.openConfig();
      }),
    }),
    vscode: t.router({
      restart: t.procedure.mutation(async () => {
        const installer = await VSCodeInstaller.create();
        await installer.restart();
      }),
      list: t.procedure.query(async () => {
        const installer = await VSCodeInstaller.create();
        return installer.list();
      }),
      purge: t.procedure.mutation(async () => {
        const installer = await VSCodeInstaller.create();
        await installer.purge();
      }),
      config: t.procedure.query(async () => {
        const installer = await VSCodeInstaller.create();
        return installer.openConfig();
      }),
    }),
  });
}
