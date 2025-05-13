import { createEnv } from "@director.run/utilities/env";
import { z } from "zod";

export const env = createEnv({
  envVars: {
    REGISTRY_PORT: z.number({ coerce: true }).optional().default(3673),
    DATABASE_URL: z
      .string()
      .default(
        "postgresql://postgres:travel-china-spend-nothing@localhost:5432/director-registry",
      ),
    // LOG_PRETTY: z.boolean().optional().default(true),
    // LOG_LEVEL: z.string().optional().default("trace"),
    // LOG_ERROR_STACK: z.boolean().optional().default(true),
  },
});
