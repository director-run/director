import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import { type ClientId, ClientStore } from "../../client-store";
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
        await clientStore.install({
          clientId: input.clientId as ClientId,
          workspace: workspaceStore.get(input.workspaceId),
          baseUrl: input.baseUrl,
        });
      }),
    uninstall: t.procedure
      .input(
        z.object({
          clientId: z.string(),
          workspaceId: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const workspace = workspaceStore.get(input.workspaceId);
        await clientStore.uninstall(input.clientId as ClientId, workspace.id);
      }),
    resetAll: t.procedure.mutation(async () => {
      await clientStore.resetAll();
    }),
  });
}
