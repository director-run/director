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

const sourceSchema = z.object({
  sourceName: z.literal("registry"),
  sourceId: requiredStringSchema,
  sourceData: z.object({}).nullish(),
});

export const ProxyTargetSchema = z.object({
  name: requiredStringSchema,
  transport: proxyTransportSchema,
});

const proxySchema = z.object({
  id: requiredStringSchema,
  name: requiredStringSchema,
  description: optionalStringSchema,
  servers: z.array(ProxyTargetSchema),
  source: sourceSchema.optional(),
});

export type ProxyAttributes = z.infer<typeof proxySchema>;

export const databaseSchema = z.object({
  proxies: z.array(proxySchema),
});

export type DatabaseSchema = z.infer<typeof databaseSchema>;
export type SourceSchema = z.infer<typeof sourceSchema>;
