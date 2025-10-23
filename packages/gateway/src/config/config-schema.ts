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

export const ToolsConfigSchema = z.object({
  include: z.array(requiredStringSchema).optional(),
  exclude: z.array(requiredStringSchema).optional(),
  prefix: z.string().trim().optional(),
});

export const ServerConfigEntrySchema = z.object({
  name: slugStringSchema,
  transport: z.discriminatedUnion("type", [
    httpTransportSchema,
    stdioTransportSchema,
  ]),
  source: z
    .object({
      name: z.literal("registry"),
      entryId: requiredStringSchema,
    })
    .optional(),
  tools: ToolsConfigSchema.optional(),
  disabled: z.boolean().optional(),
});

export type ServerConfigEntry = z.infer<typeof ServerConfigEntrySchema>;
