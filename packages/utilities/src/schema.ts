import { z } from "zod";

export const requiredStringSchema = z.string().trim().min(1, "Required");
export const optionalStringSchema = requiredStringSchema.nullish();

export const parameterSchema = z.object({
  name: requiredStringSchema,
  description: requiredStringSchema,
  scope: z.enum(["env", "args"]),
  required: z.boolean(),
  type: z.enum(["string"]),
  password: z.boolean().optional(),
});

export type Parameter = z.infer<typeof parameterSchema>;

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

export const sourceEntrySchema = z.object({
  id: requiredStringSchema,
  name: requiredStringSchema,
  title: requiredStringSchema,
  description: requiredStringSchema,
  icon: optionalStringSchema,
  createdAt: z.date().nullable(),
  isOfficial: z.boolean().nullable(),
  isEnriched: z.boolean().nullable(),
  isConnectable: z.boolean().nullable(),
  lastConnectionAttemptedAt: z.date().nullable(),
  lastConnectionError: optionalStringSchema,
  homepage: optionalStringSchema,
  transport: z.any(),
  source_registry: z.any(),
  categories: z.array(z.string()).nullable(),
  tools: z.array(toolSchema).nullable(),
  parameters: z.array(
    z.object({
      name: requiredStringSchema,
      description: requiredStringSchema,
      scope: z.enum(["env", "args"]),
      required: z.boolean(),
      type: z.enum(["string"]),
      password: z.boolean().optional(),
    }),
  ),
  readme: optionalStringSchema,
});

export type SourceEntry = z.infer<typeof sourceEntrySchema>;

export const sourceSchema = z.object({
  name: z.literal("registry"),
  entryId: requiredStringSchema,
  entryData: sourceEntrySchema,
});

export type Source = z.infer<typeof sourceSchema>;

export const httpTransportSchema = z.object({
  type: z.literal("http"),
  url: requiredStringSchema,
});

export type HTTPTransport = z.infer<typeof httpTransportSchema>;

export const stdioTransportSchema = z.object({
  type: z.literal("stdio"),
  command: requiredStringSchema,
  args: z.array(z.string()).optional(),
  env: z.record(requiredStringSchema, z.string()).optional(),
});

export type STDIOTransport = z.infer<typeof stdioTransportSchema>;

export const proxyTransport = z.discriminatedUnion("type", [
  httpTransportSchema,
  stdioTransportSchema,
]);

export type ProxyTransport = z.infer<typeof proxyTransport>;

export const proxyTargetAttributesSchema = z.object({
  name: requiredStringSchema,
  transport: proxyTransport,
  source: sourceSchema.optional(),
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
