import { toolSchema } from "@director.run/registry/db/schema";
import { z } from "zod";

const requiredStringSchema = z.string().trim().min(1, "Required");
const optionalStringSchema = z.string().trim().nullish();

const proxyTransportSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("stdio"),
    command: requiredStringSchema,
    args: z.array(requiredStringSchema).optional(),
    env: z.record(requiredStringSchema, requiredStringSchema).optional(),
  }),
  z.object({
    type: z.literal("http"),
    url: requiredStringSchema,
  }),
]);

export const sourceEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  createdAt: z.string(),
  isOfficial: z.boolean(),
  isEnriched: z.boolean(),
  isConnectable: z.boolean(),
  lastConnectionAttemptedAt: z.string().nullish(),
  lastConnectionError: z.string().nullish(),
  homepage: z.string().nullish(),
  transport: z.any(),
  source_registry: z.any(),
  categories: z.array(z.string()),
  tools: z.array(toolSchema),
  parameters: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      scope: z.enum(["env", "args"]),
      required: z.boolean(),
      type: z.enum(["string"]),
      password: z.boolean().optional(),
    }),
  ),
  readme: z.string().nullish(),
});

export type SourceEntry = z.infer<typeof sourceEntrySchema>;

export const sourceSchema = z.object({
  name: z.literal("registry"),
  entryId: z.string(),
  entryData: sourceEntrySchema,
});

export type Source = z.infer<typeof sourceSchema>;

export const ProxyTargetSchema = z.object({
  name: requiredStringSchema,
  transport: proxyTransportSchema,
  source: sourceSchema.optional(),
});

const proxySchema = z.object({
  id: requiredStringSchema,
  name: requiredStringSchema,
  description: optionalStringSchema,
  servers: z.array(ProxyTargetSchema),
});

export type ProxyAttributes = z.infer<typeof proxySchema>;

export const databaseSchema = z.object({
  proxies: z.array(proxySchema),
});

export type DatabaseSchema = z.infer<typeof databaseSchema>;
export type SourceSchema = z.infer<typeof sourceSchema>;
