import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import { ProxyTargetSchema } from "../../db/schema";
import {
  getStreamablePathForProxy,
  restartConnectedClients,
} from "../../helpers";
import { ProxyServerStore } from "../../proxy-server-store";

const ProxyCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  servers: z.array(ProxyTargetSchema).optional(),
});

const ProxyUpdateSchema = ProxyCreateSchema.omit({
  servers: true,
}).partial();

export function createProxyStoreRouter({
  proxyStore,
}: { proxyStore: ProxyServerStore }) {
  return t.router({
    getAll: t.procedure.query(async () => {
      return (await proxyStore.getAll()).map((proxy) => ({
        ...proxy.toPlainObject(),
        path: getStreamablePathForProxy(proxy.id),
      }));
    }),

    get: t.procedure
      .input(z.object({ proxyId: z.string() }))
      .query(({ input }) => {
        return {
          ...proxyStore.get(input.proxyId).toPlainObject(),
          path: getStreamablePathForProxy(input.proxyId),
        };
      }),

    create: t.procedure.input(ProxyCreateSchema).mutation(async ({ input }) => {
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
          attributes: ProxyUpdateSchema,
        }),
      )
      .mutation(async ({ input }) => {
        return (
          await proxyStore.update(input.proxyId, {
            name: input.attributes.name,
            description: input.attributes.description ?? undefined,
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
                env: z.record(z.string(), z.string()).optional(),
              }),
              z.object({
                type: z.literal("http"),
                url: z.string().url(),
              }),
            ]),
            source: z
              .object({
                name: z.literal("registry"),
                entryId: z.string(),
                entryData: z.any(),
              })
              .optional(),
          }),
        }),
      )
      .mutation(async ({ input }) => {
        const proxy = await proxyStore.addServer(input.proxyId, input.server);
        await restartConnectedClients(proxy);
        return proxy.toPlainObject();
      }),

    purge: t.procedure.mutation(() => proxyStore.purge()),

    removeServer: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          serverName: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const proxy = await proxyStore.removeServer(
          input.proxyId,
          input.serverName,
        );
        await restartConnectedClients(proxy);
        return proxy.toPlainObject();
      }),
  });
}
