import { jsonSchemaToZod } from "json-schema-to-zod";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const requiredStringSchema = z.string().trim().min(1, "Required");
export const optionalStringSchema = requiredStringSchema.optional();

export const serializeZodSchema = (schema: z.ZodSchema) => {
  return zodToJsonSchema(schema);
};

export const unserializeZodSchema = (json: object) => {
  return jsonSchemaToZod(json);
};
