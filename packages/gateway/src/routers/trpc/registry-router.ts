import {} from "@director.run/installer/claude";
import type { ProxyTransport } from "@director.run/mcp/types";
import { createRegistryClient } from "@director.run/registry/client";
import type { EntryParameter } from "@director.run/registry/db/schema";
import {
  optionalStringSchema,
  requiredStringSchema,
} from "@director.run/utilities/schema";
import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import { REGISTRY_ENTRY_NAME_PREFIX } from "../../config";
import { restartConnectedClients } from "../../helpers";
import type { ProxyServerStore } from "../../proxy-server-store";

const parameterToZodSchema = (parameter: EntryParameter) => {
  if (parameter.type === "string") {
    return parameter.required ? requiredStringSchema : optionalStringSchema;
  } else {
    throw new Error(`Unsupported parameter type: ${parameter.type}`);
  }
};

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

        let transport: ProxyTransport;

        if (entry.transport.type === "stdio") {
          const env: Record<string, string> = {};
          let args: string[] = [...entry.transport.args];
          // only stdio transports have parameters
          entry.parameters?.forEach((parameter) => {
            const inputValue = input.parameters?.[parameter.name];
            const schema = parameterToZodSchema(parameter);

            schema.parse(inputValue);

            if (!inputValue) {
              // Not a required parameter, so we can skip it
              return;
            }

            // Substitute the parameter into the transport command
            if (parameter.scope === "env") {
              env[parameter.name] = inputValue;
            } else if (parameter.scope === "args") {
              args = args.map((arg) => arg.replace(parameter.name, inputValue));
            }
          });

          transport = {
            env,
            args,
            type: "stdio",
            command: entry.transport.command,
          };
        } else {
          transport = {
            type: "http",
            url: entry.transport.url,
          };
        }

        const newProxy = await proxyStore.addServer(input.proxyId, {
          name: `${REGISTRY_ENTRY_NAME_PREFIX}${entry.name}`,
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
