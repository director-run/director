import { createRegistryClient } from "@director.run/registry/client";
import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import type { ProxyServerStore } from "../../proxy-server-store";

export function createRegistryRouter({
  registryURL,
  proxyStore,
}: { proxyStore: ProxyServerStore; registryURL: string }) {
  const registryClient = createRegistryClient(registryURL);

  return t.router({
    getEntries: t.procedure
      .input(
        z.object({
          pageIndex: z.number().min(0),
          pageSize: z.number().min(1),
        }),
      )
      .query(({ input }) => registryClient.entries.getEntries.query(input)),

    getEntryByName: t.procedure
      .input(z.object({ name: z.string() }))
      .query(({ input }) => registryClient.entries.getEntryByName.query(input)),

    addServerFromRegistry: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          entryName: z.string(),
          parameters: z.record(z.string(), z.string()).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const entry = await registryClient.entries.getEntryByName.query({
          name: input.entryName,
        });

        // entry.parameters?.forEach((parameter) => {
        //   const schema = unserializeZodSchema(parameter.schema);
        //   console.log("--->", schema);
        //   // schema.parse(input.parameters?.[parameter.name]);
        // });

        return (
          await proxyStore.addServer(input.proxyId, {
            name: `registry:${entry.name}`,
            transport:
              entry.transport.type === "stdio"
                ? {
                    type: "stdio",
                    command: entry.transport.command,
                    args: entry.transport.args,
                    env: entry.transport.env
                      ? Object.entries(entry.transport.env).map(
                          ([key, value]) => `${key}=${value}`,
                        )
                      : undefined,
                  }
                : {
                    type: "sse",
                    url: entry.transport.url,
                  },
          })
        ).toPlainObject();
      }),
  });
}
