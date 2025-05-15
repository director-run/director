import { ClaudeInstaller } from "@director.run/installer/claude";
import { CursorInstaller } from "@director.run/installer/cursor";
import { isProduction } from "@director.run/utilities/env";
import { t } from "@director.run/utilities/trpc";
import { joinURL } from "@director.run/utilities/url";
import { z } from "zod";
import { getPathForProxy } from "../../helpers";
import type { ProxyServerStore } from "../../proxy-server-store";

export function createInstallerRouter({
  proxyStore,
}: { proxyStore: ProxyServerStore }) {
  return t.router({
    claude: t.router({
      install: t.procedure
        .input(
          z.object({
            proxyId: z.string(),
            baseUrl: z.string(),
            cliPath: z.string(),
          }),
        )
        .mutation(async ({ input }) => {
          const proxy = proxyStore.get(input.proxyId);
          const proxySSEUrl = joinURL(input.baseUrl, getPathForProxy(proxy.id));
          const installer = await ClaudeInstaller.create();
          if (isProduction()) {
            // In production, we don't use bun as the CLI is compiled to a binary
            await installer.install({
              name: proxy.id,
              transport: {
                command: input.cliPath,
                args: ["sse2stdio", proxySSEUrl],
              },
            });
          } else {
            await installer.install({
              name: proxy.id,
              transport: {
                command: "bun",
                args: [input.cliPath, "sse2stdio", proxySSEUrl],
              },
            });
          }
        }),
      uninstall: t.procedure
        .input(z.object({ proxyId: z.string() }))
        .mutation(async ({ input }) => {
          const proxy = proxyStore.get(input.proxyId);
          const installer = await ClaudeInstaller.create();
          await installer.uninstall(proxy.id);
        }),
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
    }),
    cursor: t.router({
      install: t.procedure
        .input(z.object({ proxyId: z.string(), baseUrl: z.string() }))
        .mutation(async ({ input }) => {
          const proxy = proxyStore.get(input.proxyId);
          const installer = await CursorInstaller.create();
          await installer.install({
            name: proxy.id,
            url: joinURL(input.baseUrl, getPathForProxy(proxy.id)),
          });
        }),
      uninstall: t.procedure
        .input(z.object({ proxyId: z.string() }))
        .mutation(async ({ input }) => {
          const proxy = proxyStore.get(input.proxyId);
          const installer = await CursorInstaller.create();
          await installer.uninstall(proxy.id);
        }),
      list: t.procedure.query(async () => {
        const installer = await CursorInstaller.create();
        return installer.list();
      }),
      purge: t.procedure.mutation(async () => {
        const installer = await CursorInstaller.create();
        await installer.purge();
      }),
    }),
  });
}
