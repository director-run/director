import {
  installToClaude,
  uninstallFromClaude,
} from "@director.run/installer/claude";
import {
  installToCursor,
  uninstallFromCursor,
} from "@director.run/installer/cursor";
import { z } from "zod";
import type { ProxyServerStore } from "../../services/proxy/proxy-server-store";
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
            await installToClaude({ proxyServer: proxy });
          } else {
            await installToCursor({ proxyServer: proxy });
          }
          return {
            status: "ok" as const,
          };
        } catch (error) {
          return {
            status: "fail" as const,
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
            await uninstallFromClaude({ proxyServer: proxy });
          } else {
            await uninstallFromCursor({ proxyServer: proxy });
          }

          return {
            status: "ok" as const,
          };
        } catch (error) {
          return {
            status: "fail" as const,
            configPath: "",
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
          };
        }
      }),
  });
}
