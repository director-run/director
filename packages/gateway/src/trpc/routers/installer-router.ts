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
    install: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          client: z.enum(["claude", "cursor"]),
        }),
      )
      .mutation(async ({ input }) => {
        try {
          const proxy = proxyStore.get(input.proxyId);
          if (input.client === "claude") {
            const installer = await ClaudeInstaller.create();
            await installer.install({
              name: proxy.attributes.name,
              transport: {
                command: path.join(__dirname, "../../../bin/proxy.js"),
                args: ["run", "proxy", proxy.id],
              },
            });
          } else {
            // await installToCursor({ proxyServer: proxy });
          }
          return {
            status: "ok",
          };
        } catch (error) {
          return {
            status: "fail",
            configPath: "",
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
    uninstall: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          client: z.enum(["claude", "cursor"]),
        }),
      )
      .mutation(async ({ input }) => {
        try {
          const proxy = proxyStore.get(input.proxyId);

          if (input.client === "claude") {
            const installer = await ClaudeInstaller.create();
            await installer.uninstall(proxy.attributes.name);
          } else {
            const installer = await CursorInstaller.create();
            await installer.uninstall(proxy.attributes.name);
          }

          return {
            status: "ok",
          };
        } catch (error) {
          return {
            status: "fail",
            configPath: "",
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
  });
}
