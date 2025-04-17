import { z } from "zod";

const requiredStringSchema = z.string().trim().min(1, "Required");
const optionalStringSchema = z.string().trim().nullish();

export const StdioTransportSchema = z.object({
  type: z.literal("stdio"),
  command: requiredStringSchema,
  args: z.array(requiredStringSchema).optional(),
  env: z.array(requiredStringSchema).optional(),
});

export type StdioTransport = z.infer<typeof StdioTransportSchema>;

export const SseTransportSchema = z.object({
  type: z.literal("sse"),
  url: requiredStringSchema,
});

export type SseTransport = z.infer<typeof SseTransportSchema>;

export const McpServerSchema = z.object({
  name: requiredStringSchema,
  transport: z.union([StdioTransportSchema, SseTransportSchema]),
});

export type McpServer = z.infer<typeof McpServerSchema>;

export const proxySchema = z.object({
  id: requiredStringSchema,
  name: requiredStringSchema,
  description: optionalStringSchema,
  url: optionalStringSchema,
  servers: z.array(McpServerSchema),
});

export type Proxy = z.infer<typeof proxySchema>;

export const databaseSchema = z.object({
  proxies: z.array(proxySchema),
});

export type DatabaseSchema = z.infer<typeof databaseSchema>;
