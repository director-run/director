import { z } from "zod";
import { optionalStringSchema, requiredStringSchema } from "./util/validation";

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
  servers: z.array(McpServerSchema),
});

export type Proxy = z.infer<typeof proxySchema>;

export const configSchema = z.object({
  version: z.literal("beta").describe("The version of the config file"),
  port: z.number(),
  proxies: z.array(proxySchema),
});

export type Config = z.infer<typeof configSchema>;
