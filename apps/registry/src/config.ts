import { createEnv } from "@director.run/utilities/env";
import { z } from "zod";

export const env = createEnv({
  envVars: {
    REGISTRY_PORT: z.number({ coerce: true }).optional().default(3673),
    REGISTRY_URL: z.string().optional().default(`http://localhost:3673`),
    DATABASE_URL: z
      .string()
      .default(
        "postgresql://postgres:travel-china-spend-nothing@localhost:5432/director-registry",
      ),
  },
});
