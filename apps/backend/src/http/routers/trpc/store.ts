import { z } from "zod";
import { ErrorCode } from "../../../helpers/error";
import { AppError } from "../../../helpers/error";
import { proxySchema } from "../../../services/db/schema";
import type { ProxyServerStore } from "../../../services/proxy/ProxyServerStore";
import { createTRPCRouter, loggedProcedure } from "./middleware";

export function createStoreRouter({
  proxyStore,
}: { proxyStore: ProxyServerStore }) {
  return createTRPCRouter({
    getAll: loggedProcedure.query(async () => {
      try {
        return (await proxyStore.getAll()).map((proxy) =>
          proxy.toPlainObject(),
        );
      } catch (error) {
        console.error(error);
        return [];
      }
    }),
    get: loggedProcedure
      .input(z.object({ proxyId: z.string() }))
      .query(async ({ input }) => {
        try {
          return proxyStore.get(input.proxyId).toPlainObject();
        } catch (e) {
          if (e instanceof AppError && e.code === ErrorCode.NOT_FOUND) {
            return undefined;
          }
          throw e;
        }
      }),
    create: loggedProcedure
      .input(proxySchema.omit({ id: true }))
      .mutation(async ({ input }) => {
        return (
          await proxyStore.create({
            name: input.name,
            description: input.description ?? undefined,
            servers: input.servers,
          })
        ).toPlainObject();
      }),
    update: loggedProcedure
      .input(
        z.object({
          proxyId: z.string(),
          attributes: proxySchema.partial(),
        }),
      )
      .mutation(async ({ input }) => {
        return (
          await proxyStore.update(input.proxyId, {
            name: input.attributes.name,
            description: input.attributes.description ?? undefined,
            servers: input.attributes.servers,
          })
        ).toPlainObject();
      }),
    delete: loggedProcedure
      .input(z.object({ proxyId: z.string() }))
      .mutation(async ({ input }) => {
        await proxyStore.delete(input.proxyId);
        return { success: true };
      }),
  });
}
