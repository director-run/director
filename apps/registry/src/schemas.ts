import { z } from "zod";

// Basic string schemas
export const requiredStringSchema = z.string().trim().min(1, "Required");
export const optionalStringSchema = requiredStringSchema.nullish();

// Transport schemas
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

export const TransportSchema = z.discriminatedUnion("type", [
  httpTransportSchema,
  stdioTransportSchema,
]);

export type Transport = z.infer<typeof TransportSchema>;

// Entry parameter schema
export const entryParameterSchema = z.object({
  name: requiredStringSchema,
  description: requiredStringSchema,
  required: z.boolean(),
  type: z.enum(["string"]),
  password: z.boolean().optional(),
});

export type EntryParameter = z.infer<typeof entryParameterSchema>;

// Tool schema
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

// Registry entry schema
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
  transport: TransportSchema,
  source_registry: z.any(),
  categories: z.array(z.string()).nullable().default(null),
  tools: z.array(toolSchema).nullable().default(null),
  parameters: z.array(entryParameterSchema),
  readme: optionalStringSchema,
  state: z.enum(["draft", "published", "archived"]).optional(),
});

export type RegistryEntry = z.infer<typeof registryEntrySchema>;
