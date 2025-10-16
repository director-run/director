import { t } from "@director.run/utilities/trpc";
import { joinURL } from "@director.run/utilities/url";
import { z } from "zod";
import { ClientStore } from "../../client-store";
import { getSSEPathForProxy, getStreamablePathForProxy } from "../../helpers";
import type { WorkspaceStore } from "../../workspaces/workspace-store";

export function createClientRouter({
  workspaceStore,
  clientStore,
}: { workspaceStore: WorkspaceStore; clientStore: ClientStore }) {
  return t.router({
    allClients: t.procedure.query(() => clientStore.toPlainObject()),
    install: t.procedure
      .input(
        z.object({
          clientId: z.string(),
          workspaceId: z.string(),
          baseUrl: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const proxy = workspaceStore.get(input.workspaceId);
        const installer = clientStore.get(input.clientId);
        const result = await installer.install({
          name: proxy.id,
          sseURL: joinURL(input.baseUrl, getSSEPathForProxy(proxy.id)),
          streamableURL: joinURL(
            input.baseUrl,
            getStreamablePathForProxy(proxy.id),
          ),
        });
        if (result.requiresRestart) {
          await installer.restart();
        }
      }),
    uninstall: t.procedure
      .input(
        z.object({
          clientId: z.string(),
          workspaceId: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const proxy = workspaceStore.get(input.workspaceId);
        const installer = clientStore.get(input.clientId);
        const result = await installer.uninstall(proxy.id);
        if (result.requiresRestart) {
          await installer.restart();
        }
      }),
    resetAll: t.procedure.mutation(async () => {
      await clientStore.resetAll();
    }),
  });
}
