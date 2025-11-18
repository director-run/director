import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import type { ClientId } from "../../client-store";
import type { GatewayContext } from "./index";

export function createClientRouter() {
  return t.router({
    allClients: t.procedure.query(({ ctx }) => {
      const { clientStore } = ctx as GatewayContext;
      return clientStore.toPlainObject();
    }),
    install: t.procedure
      .input(
        z.object({
          clientId: z.string(),
          playbookId: z.string(),
          baseUrl: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { playbookStore, clientStore } = ctx as GatewayContext;
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
      .mutation(async ({ ctx, input }) => {
        const { playbookStore, clientStore } = ctx as GatewayContext;
        const playbook = playbookStore.get(input.playbookId);
        await clientStore.uninstall(input.clientId as ClientId, playbook.id);
      }),
    resetAll: t.procedure.mutation(async ({ ctx }) => {
      const { clientStore } = ctx as GatewayContext;
      await clientStore.resetAll();
    }),
  });
}
