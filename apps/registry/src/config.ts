import path from "path";
import { createEnv, isProduction, isTest } from "@director.run/utilities/env";
import { z } from "zod";

export const env = createEnv({
  envFilePath: getEnvFilePath(),
  envVars: {
    REGISTRY_PORT: z.number({ coerce: true }),
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
