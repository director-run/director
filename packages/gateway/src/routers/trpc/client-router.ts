import { protectedProcedure, t } from "@director.run/utilities/trpc";
import { z } from "zod";
import type { ClientId } from "../../client-store";
import type { GatewayContext } from "./index";

export function createClientRouter() {
  return t.router({
    allClients: protectedProcedure.query(({ ctx }) => {
      const { clientStore } = ctx as GatewayContext;
      return clientStore.toPlainObject();
    }),
    install: protectedProcedure
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
    uninstall: protectedProcedure
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
    resetAll: protectedProcedure.mutation(async ({ ctx }) => {
      const { clientStore } = ctx as GatewayContext;
      await clientStore.resetAll();
    }),
  });
}
