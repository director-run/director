import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import type { ClientId } from "../../client-store";
import { type AuthenticatedGatewayContext, protectedProcedure } from "./index";

export function createClientRouter() {
  return t.router({
    allClients: protectedProcedure.query(({ ctx }) => {
      const { clientStore } = ctx as AuthenticatedGatewayContext;
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
        const { playbookStore, clientStore, userId } =
          ctx as AuthenticatedGatewayContext;
        await clientStore.install({
          clientId: input.clientId as ClientId,
          playbook: playbookStore.get(input.playbookId, userId),
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
        const { playbookStore, clientStore, userId } =
          ctx as AuthenticatedGatewayContext;
        const playbook = playbookStore.get(input.playbookId, userId);
        await clientStore.uninstall(input.clientId as ClientId, playbook.id);
      }),
    resetAll: protectedProcedure.mutation(async ({ ctx }) => {
      const { clientStore } = ctx as AuthenticatedGatewayContext;
      await clientStore.resetAll();
    }),
  });
}
