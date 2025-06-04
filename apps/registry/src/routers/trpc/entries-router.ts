import type { ProxyTransport } from "@director.run/mcp/types";
import {
  optionalStringSchema,
  requiredStringSchema,
} from "@director.run/utilities/schema";
import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import { protectedProcedure } from ".";
import { type EntryParameter, toolSchema } from "../../db/schema";
import type { Store } from "../../db/store";
import { enrichEntries } from "../../enrichment/enrich";
import { entries } from "../../seed/entries";

const parameterToZodSchema = (parameter: EntryParameter) => {
  if (parameter.type === "string") {
    return parameter.required ? requiredStringSchema : optionalStringSchema;
  } else {
    throw new Error(`Unsupported parameter type: ${parameter.type}`);
  }
};

export function createEntriesRouter({ store }: { store: Store }) {
  return t.router({
    getEntries: t.procedure
      .input(
        z.object({
          pageIndex: z.number().min(0),
          pageSize: z.number().min(1),
        }),
      )
      .query(({ input }) => store.entries.paginateEntries(input)),

    getEntryByName: t.procedure
      .input(z.object({ name: z.string() }))
      .query(({ input }) => store.entries.getEntryByName(input.name)),

    getTransportForEntry: t.procedure
      .input(
        z.object({
          entryName: z.string(),
          parameters: z.record(z.string(), z.string()).optional(),
        }),
      )
      .query(async ({ input }) => {
        const entry = await store.entries.getEntryByName(input.entryName);

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

        return transport;
      }),

    purge: protectedProcedure.input(z.object({})).mutation(async () => {
      await store.entries.deleteAllEntries();
    }),

    updateEntry: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          isConnectable: z.boolean().optional(),
          lastConnectionAttemptedAt: z.date().optional(),
          lastConnectionError: z.string().optional(),
          tools: z.array(toolSchema).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        await store.entries.updateEntry(input.id, {
          isConnectable: input.isConnectable,
          lastConnectionAttemptedAt: input.lastConnectionAttemptedAt,
          lastConnectionError: input.lastConnectionError,
          tools: input.tools,
        });
      }),

    populate: protectedProcedure.input(z.object({})).mutation(async () => {
      await store.entries.deleteAllEntries();
      await store.entries.addEntries(entries);
    }),

    enrich: protectedProcedure.input(z.object({})).mutation(async () => {
      await enrichEntries(store);
    }),

    stats: protectedProcedure.input(z.object({})).query(async () => {
      return await store.entries.getStatistics();
    }),
  });
}
