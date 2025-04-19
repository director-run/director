import { z } from "zod";
import {
  installToClaude,
  uninstallFromClaude,
} from "../../../services/installer/claude";
import {
  installToCursor,
  uninstallFromCursor,
} from "../../../services/installer/cursor";
import type { ProxyServerStore } from "../../../services/proxy/proxy-server-store";
import { createTRPCRouter, loggedProcedure } from "./middleware";

export function createInstallerRouter({
  proxyStore,
}: { proxyStore: ProxyServerStore }) {
  return createTRPCRouter({
    install: loggedProcedure
      .input(
        z.object({
          proxyId: z.string(),
          client: z.enum(["claude", "cursor"]),
        }),
      )
      .mutation(async ({ input }) => {
        try {
          const proxy = await proxyStore.get(input.proxyId);
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
    uninstall: loggedProcedure
      .input(
        z.object({
          proxyId: z.string(),
          client: z.enum(["claude", "cursor"]),
        }),
      )
      .mutation(async ({ input }) => {
        try {
          const proxy = await proxyStore.get(input.proxyId);
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
