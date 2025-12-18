import {
  type HTTPClientPlainObject,
  HTTPClientSchema,
} from "@director.run/mcp/client/http-client";
import {
  type StdioClientPlainObject,
  StdioClientSchema,
} from "@director.run/mcp/client/stdio-client";
import {
  optionalStringSchema,
  requiredStringSchema,
} from "@director.run/utilities/schema";
import { z } from "zod";
import { PromptSchema } from "../capabilities/prompt-manager";

export const PlaybookHTTPTargetSchema = HTTPClientSchema.extend({
  type: z.literal("http"),
});

export type PlaybookHTTPTarget = z.infer<typeof PlaybookHTTPTargetSchema>;

export const PlaybookStdioTargetSchema = StdioClientSchema.extend({
  type: z.literal("stdio"),
});

export type PlaybookStdioTarget = z.infer<typeof PlaybookStdioTargetSchema>;

export const PlaybookTargetSchema = z.union([
  PlaybookHTTPTargetSchema,
  PlaybookStdioTargetSchema,
]);

export type PlaybookTarget = z.infer<typeof PlaybookTargetSchema>;

export const PlaybookSchema = z.object({
  id: requiredStringSchema,
  name: requiredStringSchema,
  description: optionalStringSchema,
  userId: requiredStringSchema,
  prompts: z.array(PromptSchema).optional(),
  servers: z.array(PlaybookTargetSchema),
});

export type PlaybookParams = z.infer<typeof PlaybookSchema>;

export type PlaybookPlainObject = Omit<PlaybookParams, "servers"> & {
  servers: (HTTPClientPlainObject | StdioClientPlainObject)[];
  paths: {
    streamable: string;
  };
};
