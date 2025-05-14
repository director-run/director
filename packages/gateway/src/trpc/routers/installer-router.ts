import path from "node:path";
import { ClaudeInstaller } from "@director.run/installer/claude";
import { CursorInstaller } from "@director.run/installer/cursor";
import { z } from "zod";
import type { ProxyServerStore } from "../../proxy-server-store";
import { t } from "../server";

export function createInstallerRouter({
  proxyStore,
}: { proxyStore: ProxyServerStore }) {
  return t.router({
    claude: t.router({
      install: t.procedure
        .input(z.object({ proxyId: z.string() }))
        .mutation(async ({ input }) => {
          const proxy = proxyStore.get(input.proxyId);
          const installer = await ClaudeInstaller.create();
          await installer.install({
            name: proxy.attributes.name,
            transport: {
              command: path.join(__dirname, "../../../bin/proxy.js"),
              args: ["run", "proxy", proxy.id],
            },
          });
        }),
      uninstall: t.procedure
        .input(z.object({ proxyId: z.string() }))
        .mutation(async ({ input }) => {
          const proxy = proxyStore.get(input.proxyId);
          const installer = await ClaudeInstaller.create();
          await installer.uninstall(proxy.attributes.name);
        }),
      list: t.procedure.query(async () => {
        const installer = await ClaudeInstaller.create();
        return installer.list();
      }),
      restart: t.procedure.query(async () => {
        const installer = await ClaudeInstaller.create();
        await installer.restartClaude();
      }),
    }),
    cursor: t.router({
      install: t.procedure
        .input(z.object({ proxyId: z.string() }))
        .mutation(async ({ input }) => {
          const proxy = proxyStore.get(input.proxyId);
          const installer = await CursorInstaller.create();
          await installer.install({
            name: proxy.attributes.name,
            url: "https://some-url.com",
          });
        }),
      uninstall: t.procedure
        .input(z.object({ proxyId: z.string() }))
        .mutation(async ({ input }) => {
          const proxy = proxyStore.get(input.proxyId);
          const installer = await CursorInstaller.create();
          await installer.uninstall(proxy.attributes.name);
        }),
    }),
  });
}
