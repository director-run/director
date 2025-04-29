import { z } from "zod";

export const requiredStringSchema = z.string().trim().min(1, "Required");
export const optionalStringSchema = z.string().trim().nullish();

export const ProxyTargetSchema = z.object({
  name: requiredStringSchema,
  transport: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("stdio"),
      command: requiredStringSchema,
      args: z.array(requiredStringSchema).optional(),
      env: z.array(requiredStringSchema).optional(),
    }),
    z.object({
      type: z.literal("sse"),
      url: requiredStringSchema,
    }),
  ]),
});

export type ProxyTargetAttributes = z.infer<typeof ProxyTargetSchema>;

export const proxySchema = z.object({
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
