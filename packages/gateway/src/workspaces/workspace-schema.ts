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

export const WorkspaceHTTPTargetSchema = HTTPClientSchema.extend({
  type: z.literal("http"),
});

export type WorkspaceHTTPTarget = z.infer<typeof WorkspaceHTTPTargetSchema>;

export const WorkspaceStdioTargetSchema = StdioClientSchema.extend({
  type: z.literal("stdio"),
});

export type WorkspaceStdioTarget = z.infer<typeof WorkspaceStdioTargetSchema>;

export const WorkspaceTargetSchema = z.union([
  WorkspaceHTTPTargetSchema,
  WorkspaceStdioTargetSchema,
]);

export type WorkspaceTarget = z.infer<typeof WorkspaceTargetSchema>;

export const WorkspaceSchema = z.object({
  id: requiredStringSchema,
  name: requiredStringSchema,
  description: optionalStringSchema,
  prompts: z.array(PromptSchema).optional(),
  servers: z.array(WorkspaceTargetSchema),
});

export type WorkspaceParams = z.infer<typeof WorkspaceSchema>;

export type WorkspacePlainObject = Omit<WorkspaceParams, "servers"> & {
  servers: (HTTPClientPlainObject | StdioClientPlainObject)[];
  paths: {
    streamable: string;
    sse: string;
  };
};
