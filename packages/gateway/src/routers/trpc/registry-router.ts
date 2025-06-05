import { createRegistryClient } from "@director.run/registry/client";
import type { EntryParameter } from "@director.run/registry/db/schema";
import { getLogger } from "@director.run/utilities/logger";
import {
  optionalStringSchema,
  requiredStringSchema,
} from "@director.run/utilities/schema";
import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import { restartConnectedClients } from "../../helpers";
import type { ProxyServerStore } from "../../proxy-server-store";

const parameterToZodSchema = (parameter: EntryParameter) => {
  if (parameter.type === "string") {
    return parameter.required ? requiredStringSchema : optionalStringSchema;
  } else {
    throw new Error(`Unsupported parameter type: ${parameter.type}`);
  }
};

const logger = getLogger("registry-router");

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

        const transport =
          await registryClient.entries.getTransportForEntry.query({
            entryName: entry.name,
            parameters: input.parameters,
          });

        const newProxy = await proxyStore.addServer(input.proxyId, {
          name: entry.name,
          transport,
          source: {
            name: "registry",
            entryId: entry.id,
            entryData: entry,
          },
        });

        await restartConnectedClients(newProxy);

        return newProxy.toPlainObject();
      }),
  });
}
