import { z } from "zod";

export const requiredStringSchema = z.string().trim().min(1, "Required");
export const optionalStringSchema = requiredStringSchema.nullish();

export const slugStringSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .regex(
    /^[a-z0-9._-]+$/,
    "Only lowercase ASCII letters, digits, and characters ., -, _ are allowed",
  );

export const httpTransportSchema = z.object({
  type: z.literal("http"),
  url: requiredStringSchema.url(),
  headers: z.record(requiredStringSchema, z.string()).optional(),
});

export type HTTPTransport = z.infer<typeof httpTransportSchema>;

export const stdioTransportSchema = z.object({
  type: z.literal("stdio"),
  command: requiredStringSchema,
  args: z.array(z.string()).default([]),
  env: z.record(requiredStringSchema, z.string()).optional(),
});

export type STDIOTransport = z.infer<typeof stdioTransportSchema>;

export const proxyTransport = z.discriminatedUnion("type", [
  httpTransportSchema,
  stdioTransportSchema,
]);

export type ProxyTransport = z.infer<typeof proxyTransport>;

export const entryParameterSchema = z.object({
  name: requiredStringSchema,
  description: requiredStringSchema,
  required: z.boolean(),
  type: z.enum(["string"]),
  password: z.boolean().optional(),
});

export type EntryParameter = z.infer<typeof entryParameterSchema>;

export const toolSchema = z.object({
  name: requiredStringSchema,
  description: requiredStringSchema,
  inputSchema: z.object({
    type: requiredStringSchema,
    required: z.array(z.string()).optional(),
    properties: z
      .record(
        requiredStringSchema,
        z.object({
          type: z.string().optional(),
          description: z.string().optional(),
          default: z.unknown().optional(),
          title: z.string().optional(),
          anyOf: z.unknown().optional(),
        }),
      )
      .optional(),
  }),
});

export type Tool = z.infer<typeof toolSchema>;

export const registryEntrySchema = z.object({
  id: requiredStringSchema,
  name: requiredStringSchema,
  title: requiredStringSchema,
  description: requiredStringSchema,
  icon: optionalStringSchema,
  createdAt: z.coerce.date().nullable().default(null),
  isOfficial: z.boolean().nullable().default(null),
  isEnriched: z.boolean().nullable().default(null),
  isConnectable: z.boolean().nullable().default(null),
  lastConnectionAttemptedAt: z.coerce.date().nullable().default(null),
  lastConnectionError: optionalStringSchema,
  homepage: requiredStringSchema,
  transport: proxyTransport,
  source_registry: z.any(),
  categories: z.array(z.string()).nullable().default(null),
  tools: z.array(toolSchema).nullable().default(null),
  parameters: z.array(entryParameterSchema),
  readme: optionalStringSchema,
});

export type RegistryEntry = z.infer<typeof registryEntrySchema>;

export const ProxyTargetSourceSchema = z.object({
  name: z.literal("registry"),
  entryId: requiredStringSchema,
  entryData: registryEntrySchema,
});

export type ProxyTargetSource = z.infer<typeof ProxyTargetSourceSchema>;

export const proxyTargetAttributesSchema = z.object({
  name: slugStringSchema,
  transport: proxyTransport,
  source: ProxyTargetSourceSchema.optional(),
});

export type ProxyTargetAttributes = z.infer<typeof proxyTargetAttributesSchema>;

export const proxyServerAttributesSchema = z.object({
  id: requiredStringSchema,
  name: requiredStringSchema,
  description: optionalStringSchema,
  servers: z.array(proxyTargetAttributesSchema),
});

export type ProxyServerAttributes = z.infer<typeof proxyServerAttributesSchema>;

export const databaseAttributesSchema = z.object({
  proxies: z.array(proxyServerAttributesSchema),
});

export type DatabaseAttributes = z.infer<typeof databaseAttributesSchema>;
