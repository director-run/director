import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import { type ClientId, ClientStore } from "../../client-store";
import type { PlaybookStore } from "../../playbooks/playbook-store";

export function createClientRouter({
  playbookStore,
  clientStore,
}: { playbookStore: PlaybookStore; clientStore: ClientStore }) {
  return t.router({
    allClients: t.procedure.query(() => clientStore.toPlainObject()),
    install: t.procedure
      .input(
        z.object({
          clientId: z.string(),
          playbookId: z.string(),
          baseUrl: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        await clientStore.install({
          clientId: input.clientId as ClientId,
          playbook: playbookStore.get(input.playbookId),
          baseUrl: input.baseUrl,
        });
      }),
    uninstall: t.procedure
      .input(
        z.object({
          clientId: z.string(),
          playbookId: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const playbook = playbookStore.get(input.playbookId);
        await clientStore.uninstall(input.clientId as ClientId, playbook.id);
      }),
    resetAll: t.procedure.mutation(async () => {
      await clientStore.resetAll();
    }),
  });
}
