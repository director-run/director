import { z } from "zod";

const requiredStringSchema = z.string().trim().min(1, "Required");
const optionalStringSchema = z.string().trim().nullish();

export const stdioTransportSchema = z.object({
  type: z.literal("stdio"),
  command: requiredStringSchema,
  args: z.array(requiredStringSchema).optional(),
  env: z.array(requiredStringSchema).optional(),
});

export type StdioTransport = z.infer<typeof stdioTransportSchema>;

export const sseTransportSchema = z.object({
  type: z.literal("sse"),
  url: requiredStringSchema,
});

export type SseTransport = z.infer<typeof sseTransportSchema>;

export const mcpServerSchema = z.object({
  name: requiredStringSchema,
  transport: z.union([stdioTransportSchema, sseTransportSchema]),
});

export type McpServer = z.infer<typeof mcpServerSchema>;

export const integrationEnum = z.enum(["claude", "cursor"]);

export type Integration = z.infer<typeof integrationEnum>;

export const proxySchema = z.object({
  id: requiredStringSchema,
  name: requiredStringSchema,
  description: optionalStringSchema,
  servers: z.array(mcpServerSchema),
  integrations: z.array(integrationEnum),
});

export const createProxySchema = proxySchema.omit({ id: true });
export type CreateProxyInput = z.infer<typeof createProxySchema>;

export type Proxy = z.infer<typeof proxySchema>;

export const databaseSchema = z.object({
  proxies: z.array(proxySchema),
});

export type DatabaseSchema = z.infer<typeof databaseSchema>;
