import { ErrorCode } from "@director.run/utilities/error";
import { AppError } from "@director.run/utilities/error";
import { z } from "zod";
import { proxySchema } from "../../db/schema";
import { getProxyServerUrl } from "../../helpers";
import { ProxyServerStore } from "../../services/proxy/proxy-server-store";
import { t } from "../server";
export function createProxyStoreRouter({
  proxyStore,
}: { proxyStore: ProxyServerStore }) {
  return t.router({
    getAll: t.procedure.query(async () => {
      try {
        return (await proxyStore.getAll()).map((proxy) => ({
          ...proxy.toPlainObject(),
          url: getProxyServerUrl(proxy.id),
        }));
      } catch (error) {
        console.error(error);
        return [];
      }
    }),
    get: t.procedure
      .input(z.object({ proxyId: z.string() }))
      .query(({ input }) => {
        try {
          return {
            ...proxyStore.get(input.proxyId).toPlainObject(),
            url: getProxyServerUrl(input.proxyId),
          };
        } catch (e) {
          if (e instanceof AppError && e.code === ErrorCode.NOT_FOUND) {
            return undefined;
          }
          throw e;
        }
      }),
    create: t.procedure
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
    update: t.procedure
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
    delete: t.procedure
      .input(z.object({ proxyId: z.string() }))
      .mutation(async ({ input }) => {
        await proxyStore.delete(input.proxyId);
        return { success: true };
      }),
    addServer: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          server: z.object({
            name: z.string(),
            transport: z.discriminatedUnion("type", [
              z.object({
                type: z.literal("stdio"),
                command: z.string(),
                args: z.array(z.string()).optional(),
                env: z.array(z.string()).optional(),
              }),
              z.object({
                type: z.literal("sse"),
                url: z.string().url(),
              }),
            ]),
          }),
        }),
      )
      .mutation(({ input }) => {
        return proxyStore.addServer(input.proxyId, input.server);
      }),
    addServerFromRegistry: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          entryId: z.string(),
        }),
      )
      .mutation(({ input }) => {
        return proxyStore.addServerFromRegistry(input.proxyId, input.entryId);
      }),
    removeServer: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          serverName: z.string(),
        }),
      )
      .mutation(({ input }) => {
        return proxyStore.removeServer(input.proxyId, input.serverName);
      }),
  });
}
