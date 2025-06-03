import { ClaudeInstaller } from "@director.run/client-manager/claude";
import { CursorInstaller } from "@director.run/client-manager/cursor";
import { t } from "@director.run/utilities/trpc";
import { joinURL } from "@director.run/utilities/url";
import { z } from "zod";
import { getSSEPathForProxy, getStreamablePathForProxy } from "../../helpers";
import type { ProxyServerStore } from "../../proxy-server-store";

export function createInstallerRouter({
  proxyStore,
}: { proxyStore: ProxyServerStore }) {
  return t.router({
    byProxy: t.router({
      list: t.procedure
        .input(z.object({ proxyId: z.string() }))
        .query(async ({ input }) => {
          const [claudeInstaller, cursorInstaller] = await Promise.all([
            ClaudeInstaller.create(),
            CursorInstaller.create(),
          ]);

          const [claudeClients, cursorClients] = await Promise.all([
            claudeInstaller.list(),
            cursorInstaller.list(),
          ]);

          const installedOnClaude = claudeClients.filter(
            (install) => install.name === `director__${input.proxyId}`,
          );
          const installedOnCursor = cursorClients.filter(
            (install) => install.name === `director__${input.proxyId}`,
          );

          return {
            claude: installedOnClaude.length > 0,
            cursor: installedOnCursor.length > 0,
          };
        }),
      install: t.procedure
        .input(
          z.object({
            client: z.enum(["claude", "cursor"]),
            proxyId: z.string(),
            baseUrl: z.string(),
          }),
        )
        .mutation(async ({ input }) => {
          const proxy = proxyStore.get(input.proxyId);

          switch (input.client) {
            case "claude":
              const proxyUrl = joinURL(
                input.baseUrl,
                getStreamablePathForProxy(proxy.id),
              );
              const claudeInstaller = await ClaudeInstaller.create();
              await claudeInstaller.install({
                name: proxy.id,
                transport: {
                  command: "npx",
                  args: ["-y", "@director.run/cli", "http2stdio", proxyUrl],
                  env: {
                    LOG_LEVEL: "silent",
                  },
                },
              });
              break;
            case "cursor":
              const cursorInstaller = await CursorInstaller.create();
              await cursorInstaller.install({
                name: proxy.id,
                url: joinURL(input.baseUrl, getSSEPathForProxy(proxy.id)),
              });
          }
        }),
      uninstall: t.procedure
        .input(
          z.object({
            client: z.enum(["claude", "cursor"]),
            proxyId: z.string(),
          }),
        )
        .mutation(async ({ input }) => {
          const proxy = proxyStore.get(input.proxyId);
          switch (input.client) {
            case "claude":
              const claudeInstaller = await ClaudeInstaller.create();
              await claudeInstaller.uninstall(proxy.id);
              break;
            case "cursor":
              const cursorInstaller = await CursorInstaller.create();
              await cursorInstaller.uninstall(proxy.id);
              break;
          }
        }),
    }),
    claude: t.router({
      list: t.procedure.query(async () => {
        const installer = await ClaudeInstaller.create();
        return installer.list();
      }),
      restart: t.procedure.mutation(async () => {
        const installer = await ClaudeInstaller.create();
        await installer.restartClaude();
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
  });
}
