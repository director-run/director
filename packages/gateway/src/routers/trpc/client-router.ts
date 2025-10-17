import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import { ClientStore } from "../../client-store";
import {} from "../../helpers";
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
          clientId: input.clientId,
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
        await clientStore.uninstall(input.clientId, workspace.id);
      }),
    resetAll: t.procedure.mutation(async () => {
      await clientStore.resetAll();
    }),
  });
}
