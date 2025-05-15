import path from "path";
import { createEnv, isProduction, isTest } from "@director.run/utilities/env";
import { z } from "zod";

const DEFAULT_PORT = 3673;

export const env = createEnv({
  envFilePath: getEnvFilePath(),
  envVars: {
    REGISTRY_PORT: z.number({ coerce: true }).optional().default(DEFAULT_PORT),
    REGISTRY_URL: z
      .string()
      .optional()
      .default(`http://localhost:${DEFAULT_PORT}`),
    DATABASE_URL: z.string(),
  },
});

function getEnvFilePath() {
  if (isTest()) {
    return path.join(__dirname, "../env/.env.test");
  } else if (isProduction()) {
    return path.join(__dirname, "../env/.env");
  } else {
    return path.join(__dirname, "../env/.env.dev");
  }
}
