import { ClaudeInstaller } from "@director.run/installer/claude";
import { CursorInstaller } from "@director.run/installer/cursor";
import { isProduction } from "@director.run/utilities/env";
import { t } from "@director.run/utilities/trpc";
import { joinURL } from "@director.run/utilities/url";
import { z } from "zod";
import { getStreamablePathForProxy } from "../../helpers";
import type { ProxyServerStore } from "../../proxy-server-store";

export function createInstallerRouter({
  proxyStore,
  cliPath,
}: { proxyStore: ProxyServerStore; cliPath: string }) {
  return t.router({
    claude: t.router({
      install: t.procedure
        .input(
          z.object({
            proxyId: z.string(),
            baseUrl: z.string(),
          }),
        )
        .mutation(async ({ input }) => {
          // Claude supports streamable over stdio well, so we use this
          // TODO: revist and aim to move to streamable, once client supports i
          const proxy = proxyStore.get(input.proxyId);
          const proxyUrl = joinURL(
            input.baseUrl,
            getStreamablePathForProxy(proxy.id),
          );
          const installer = await ClaudeInstaller.create();
          if (isProduction()) {
            // In production, we don't use bun as the CLI is compiled to a binary
            await installer.install({
              name: proxy.id,
              transport: {
                command: cliPath,
                args: ["http2stdio", proxyUrl],
                env: {
                  LOG_LEVEL: "silent",
                },
              },
            });
          } else {
            await installer.install({
              name: proxy.id,
              transport: {
                command: "bun",
                args: [cliPath, "http2stdio", proxyUrl],
                env: {
                  LOG_LEVEL: "silent",
                },
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
      config: t.procedure.query(async () => {
        const installer = await ClaudeInstaller.create();
        return installer.openConfig();
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
            url: joinURL(input.baseUrl, getStreamablePathForProxy(proxy.id)),
          });
        }),
      restart: t.procedure.mutation(async () => {
        const installer = await CursorInstaller.create();
        await installer.restart();
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
      config: t.procedure.query(async () => {
        const installer = await CursorInstaller.create();
        return installer.openConfig();
      }),
    }),
  });
}
