import { AppError, ErrorCode } from "@director.run/utilities/error";
import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import { ProxyTargetSchema } from "../../db/schema";
import { getPathForProxy } from "../../helpers";
import { ProxyServerStore } from "../../proxy-server-store";

const ProxyCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  servers: z.array(ProxyTargetSchema).optional(),
});

const ProxyUpdateSchema = ProxyCreateSchema.partial();

export function createProxyStoreRouter({
  proxyStore,
}: { proxyStore: ProxyServerStore }) {
  return t.router({
    getAll: t.procedure.query(async () => {
      try {
        return (await proxyStore.getAll()).map((proxy) => ({
          ...proxy.toPlainObject(),
          path: getPathForProxy(proxy.id),
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
            path: getPathForProxy(input.proxyId),
          };
        } catch (e) {
          if (e instanceof AppError && e.code === ErrorCode.NOT_FOUND) {
            return undefined;
          }
          throw e;
        }
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
